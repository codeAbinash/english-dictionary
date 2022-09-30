export function fontawesome(){
    let script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/js/all.min.js'
    script.crossOrigin = 'anonymous'
    if(document.head)
        document.head.appendChild(script)
    else
        console.warn('Fontawsesome Icon is not loaded');
}

fontawesome()