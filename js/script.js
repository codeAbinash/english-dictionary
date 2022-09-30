// import { } from './lib/fontawesome.js'
import debounce from './lib/debounce.js'


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
searchInputMain.oninput = debounce((e) => {
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
            controller.abort()
        })
}, 200, false)


searchInputMain.onsearch = ()=>{
    searchInputMain.blur()
}














/// 
const results = document.getElementById('results')
const noResults = document.getElementById('noResult')

function successResults(){
    results.style.display = 'block'
    noResults.style.display = 'none'
}
function failResult(){
    results.style.display = 'none'
    noResults.style.display = 'block'
}
function showData(data) {
    results.innerHTML = ''
    console.log(data)
    if (data instanceof Array) {
        successResults()
        data.forEach(rootWords => {
            const result = document.createElement('div')
            result.classList.add('result')
            result.innerHTML = `<div class="word">
            <h2>${rootWords.word}</h2>
            <div class="actions">
                <img src="./image/icon/volume_up_color_48dp.svg">
                <img src="./image/icon/favorite_border_color_48dp.svg">
            </div>
        </div>
            <div class="phonetics">
                <p><span>${rootWords.phonetic || 'Phonetics not available'}</span></p>
            </div>`
            // result.innerHTML += `<div class='gap'></div>`
            result.append(makeMeanings(rootWords.meanings))
            results.append(result)
            results.innerHTML += '<div class="gap"></div>'
        })
    }
    else {
        failResult()
        results.innerHTML = `<h1>No Result Found</h1>`
    }
}

/**
 * 
 * @param {Array} meanings 
 */
function makeMeanings(meanings) {
    const meaningDOM = document.createElement('div')
    meaningDOM.classList.add('meanings')
    meanings.forEach(meaning => {
        meaningDOM.innerHTML += `<div class='gap'></div>`
        meaningDOM.append(makeMeaning(meaning))
    })
    function makeMeaning(meaning) {
        const meaningDOM = document.createElement('div')
        meaningDOM.classList.add('meaning')
        meaningDOM.innerHTML = ` <div class="type"><span>${meaning.partOfSpeech}</span></div>`
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
                words.innerHTML += `<span>${a}</span>`
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
                words.innerHTML += `<span>${a}</span>`
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
                        words.innerHTML += `<span>${s}</span>`
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
                        words.innerHTML += `<span>${s}</span>`
                    })
                    antDOM.append(words)
                    return antDOM
                }


                function makeExamples(ex) {
                    const exDOM = document.createElement('div')
                    exDOM.classList.add('example')
                    exDOM.innerHTML = `<div class="name"><span>Example</span></div>`
                    exDOM.innerHTML += `<div class="ex">${ex}</div>`
                    return exDOM
                }
            }
        }

    }
    return meaningDOM
}
