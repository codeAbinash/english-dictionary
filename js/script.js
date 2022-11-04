// import { } from './lib/fontawesome.js'
import debounce from './lib/debounce.js'
import animations from './animations.js'

animations()

// Register a Service Worker

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = navigator.serviceWorker.register('./sw.js')
            console.log('Service Worker Registered')
        } catch (error) {
            console.warn("Error Registering Service Worker")
            console.log(error)
        }
    } else
        console.log('Service worker is not available for this device')
}
// registerSW()




// Navigation bar click 
const options = document.querySelectorAll('#main .bottom .option')
const screens = document.querySelectorAll('#main .screen-container .screen')
const searchInputMain = document.getElementById('input-search-word')
const pseudoSearchInput = document.getElementById('pseudoSearchInput')
/// Screens

function getId(id) { return document.getElementById(id) }

const searchScreens = {
    results: getId('search-results'),
    noResults: getId('search-noResult'),
    loadingScreen: getId('search-loadingScreen'),
    searchStartScreen: getId('search-startScreen'),
}

const screenCallback = [
    () => {
        console.log("First Screen")
    },
    () => {
        setTimeout(() => {
            searchInputMain.focus()
        }, 100);
    },
    () => {

        console.log("Third Screen")
    },
    () => {
        console.log("Forth Screen")

    }
]


let lastScreen = 0
let currentScreen = 0
options.forEach(option => {
    option.onclick = (e) => {
        lastScreen = currentScreen
        currentScreen = option.getAttribute('data-screen')
        screenCallback[currentScreen]()
        activeScreen(currentScreen, lastScreen)
    }
})






function activeScreen(currentScreen, lastScreen) {
    // console.log(currentScreen, lastScreen)
    currentScreen = Number(currentScreen)
    lastScreen = Number(lastScreen)
    if (currentScreen === lastScreen)
        return
    screens[currentScreen].classList.add('active')
    options[currentScreen].classList.add('active')
    screens[lastScreen].classList.remove('active')
    options[lastScreen].classList.remove('active')
}



pseudoSearchInput.onclick = () => {
    lastScreen = 1
    currentScreen = 1
    activeScreen(1, 0)
    searchInputMain.focus()
}





let lastInputData
searchInputMain.oninput = debounce(e => searchWord(e), 350, false)

searchInputMain.onsearch = () => { searchInputMain.blur() }

function searchWord(e) {
    showScreen('loading')

    if (e.target.value) {
        let searchData = lastInputData = e.target.value.trim()
        if (!searchData)
            return

        // Everything is ok 
        let controller = new AbortController()
        let signal = controller.signal
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${searchData}`

        fetch(url, { signal }).then(res => {
            if (lastInputData !== searchData)
                controller.abort()
            return res.json()
        })
            .then(data => {
                showData(data)
                // const elem_touch_hold_option = document.querySelectorAll('img')
                // elem_touch_hold_option.forEach(elem => elem.addEventListener('contextmenu', absorbEvent_))
                controller.abort()
            })
    } else {
        searchInputMain.focus()
        showScreen('start-screen')
    }
    // if (e.target.value == '')
}



let lastSearchScreen = searchScreens.searchStartScreen
function showScreen(screen) {
    lastSearchScreen.style.display = 'none'
    switch (screen) {
        case 'start-screen':
            searchScreens.searchStartScreen.style.display = 'block'
            lastSearchScreen = searchScreens.searchStartScreen
            break
        case 'not-found':
            searchScreens.noResults.style.display = 'block'
            lastSearchScreen = searchScreens.noResults
            break
        case 'loading':
            searchScreens.loadingScreen.style.display = 'block'
            lastSearchScreen = searchScreens.loadingScreen
            break
        case 'results':
            searchScreens.results.style.display = 'block'
            lastSearchScreen = searchScreens.results
            break
    }
}






let currentWord

function showData(data) {
    searchScreens.results.innerHTML = ''
    console.log(data)
    if (data instanceof Array) {
        showScreen('results')
        data.forEach(rootWords => {
            currentWord = rootWords.word
            const result = document.createElement('div')
            result.classList.add('result')
            result.append(makeWordTitle(rootWords.word))
            result.append(makePhonetics(rootWords.phonetic))
            // result.append(makeActionButtons(rootWords.word))

            function makeWordTitle(title) {
                const words = document.createElement('div')
                words.classList.add('word')
                words.innerHTML = `<h2>${title}</h2>`
                words.append(makeActionButtons(title))

                function makeActionButtons() {
                    const actions = document.createElement('div')
                    actions.classList.add('actions')

                    const voice = document.createElement('img')
                    voice.src = "./image/icon/volume_up_color_48dp.svg"
                    voice.classList.add('voice-button')

                    const favorite = document.createElement('img')
                    favorite.src = "./image/icon/favorite_border_color_48dp.svg"
                    favorite.classList.add('fav-button')

                    actions.append(voice, favorite)
                    return actions
                }
                return words
            }

            function makePhonetics(ph) {
                const phonetic = document.createElement('div')
                phonetic.classList.add('phonetics')
                phonetic.innerHTML = `<p><span>${ph || getPhoneticsText() || 'Phonetics is not available'}</span></p>`
                return phonetic
                function getPhoneticsText() {
                    let phonetics = rootWords.phonetics
                    for (let i = 0; i < phonetics.length; i++)
                        if (phonetics[i].text)
                            return phonetics[i].text
                }
            }
            result.append(makeMeanings(rootWords))
            searchScreens.results.append(result)
            searchScreens.results.innerHTML += '<div class="gap"></div>'
        })
        setAudio(data)
        setClickToFav(data)
    }
    else {
        showScreen('not-found')
        searchScreens.results.innerHTML = `<h1>No Result Found</h1>`
    }

    function setClickToFav(wordData) {
        const favElements = document.querySelectorAll('#search-results .result .word >.actions img.fav-button')
        let countFav = 0
        favElements.forEach(elem => {
            const word = wordData[countFav].word
            elem.onclick = () => {
                // toggle icons
                addToFav(word)
            }
            countFav++
        })
    }

    function setAudio(data) {
        const audioElements = document.querySelectorAll('#search-results .result .word >.actions img.voice-button')
        let audioCount = 0
        audioElements.forEach(elem => {
            if (data[audioCount].phonetics.length) {
                const audio = new Audio(getAudioSource(data[audioCount].phonetics))
                elem.onclick = () => { audio.play()}
            }
            audioCount++
        })

        function getAudioSource(phonetics) {
            for (let i = 0; i < phonetics.length; i++)
                if (phonetics[i].audio)
                    return phonetics[i].audio
            // console.log(phonetics[i].audio)
        }
    }
}

/**
 * 
 * @param {Array} meanings 
 */
function makeMeanings(word) {
    let meanings = word.meanings
    const meaningDOM = document.createElement('div')
    meaningDOM.classList.add('meanings')
    meanings.forEach(meaning => {
        meaningDOM.innerHTML += `<div class='gap'></div>`
        meaningDOM.append(makeMeaning(meaning))
    })

    function makeMeaning(meaning) {
        const meaningDOM = document.createElement('div')
        meaningDOM.classList.add('meaning')
        meaningDOM.innerHTML = ` <div class="type"><span class="color">${word.word} : </span> <span>${meaning.partOfSpeech}</span></div>`
        meaningDOM.append(makeDefinitions(meaning.definitions))
        if (meaning.synonyms.length)
            meaningDOM.append(makeSynonyms(meaning.synonyms))
        if (meaning.antonyms.length)
            meaningDOM.append(makeAntonyms(meaning.antonyms))

        return meaningDOM

        function makeAntonyms(ant) {
            const antDOM = document.createElement('div')
            antDOM.classList.add('antonyms')
            antDOM.innerHTML = `<span class="name">Antonyms</span>`

            const words = document.createElement('div')
            words.classList.add('words')
            ant.forEach(a => {
                words.innerHTML += `<span class='press'>${a}</span>`
            })
            antDOM.append(words)
            return antDOM
        }

        function makeSynonyms(syn) {
            const antDOM = document.createElement('div')
            antDOM.classList.add('synonyms')
            antDOM.innerHTML = `<span class="name">Synonyms</span>`
            const words = document.createElement('div')
            words.classList.add('words')
            syn.forEach(a => {
                words.innerHTML += `<span class='press'>${a}</span>`
            })
            antDOM.append(words)
            return antDOM
        }



        /**
         * 
         * @param {Array} def 
         */
        function makeDefinitions(def) {
            const definitionsDOM = document.createElement('div')
            definitionsDOM.classList.add('definitionss')
            def.forEach(d => {
                definitionsDOM.append(makeDefinition(d))
            })
            return definitionsDOM

            function makeDefinition(d) {
                const dDOM = document.createElement('div')
                dDOM.classList.add('definitions')
                dDOM.innerHTML = `<div class="text"><span>${d.definition}</span></div>`
                if (d.example) {
                    dDOM.append(makeExamples(d.example))
                }
                if (d.synonyms.length)
                    dDOM.append(makeSynonyms(d.synonyms))
                if (d.antonyms.length)
                    dDOM.append(makeAntonyms(d.antonyms))

                return dDOM

                function makeSynonyms(syn) {
                    const synDOM = document.createElement('div')
                    synDOM.classList.add('synonyms')
                    synDOM.innerHTML = `<div class="name"><span>Synonyms</span></div>`

                    const words = document.createElement('div')
                    words.classList.add('words')
                    syn.forEach(s => {
                        words.innerHTML += `<span class='press'>${s}</span>`
                    })
                    synDOM.append(words)
                    return synDOM
                }
                function makeAntonyms(ant) {
                    const antDOM = document.createElement('div')
                    antDOM.classList.add('antonyms')
                    antDOM.innerHTML = `<div class="name"><span>Antonyms</span></div>`
                    const words = document.createElement('div')
                    words.classList.add('words')
                    ant.forEach(s => {
                        words.innerHTML += `<span class='press'>${s}</span>`
                    })
                    antDOM.append(words)
                    return antDOM
                }


                function makeExamples(ex) {
                    const exDOM = document.createElement('div')
                    exDOM.classList.add('example')
                    exDOM.innerHTML = `<div class="name"><span>Example</span></div>`
                    ex = highlightWord(ex)
                    exDOM.innerHTML += `<div class="ex">${ex}</div>`
                    return exDOM
                }
            }
        }

    }
    return meaningDOM
}

function highlightWord(e) {
    let w =
        `([^a-z]${currentWord}[^a-z])|(^${currentWord}[^a-z])|([^a-z]${currentWord}$)`
    return e.replace(new RegExp(w, 'gi'), replacer)
    function replacer(match) {
        return match.replace(
            new RegExp(`(${currentWord})`, 'gi'),
            `<span class='color'>$1</span>`
        )
    }
}


function addToFav(w) {
    console.log(w)
}


// Disable press and hold options

function absorbEvent_(event) {
    var e = event || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}
document.body.addEventListener('contextmenu', absorbEvent_)