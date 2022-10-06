export default function animations() {
    const tap_ripple = document.querySelectorAll('.tap-ripple')

    tap_ripple.forEach(elem => {
        elem.addEventListener('mousedown', (e) => {
            addAnimation(e, elem)
            elem.classList.add('pulse')
            elem.addEventListener('animationend', ()=>{
                elem.classList.remove('pulse')
            })
        })
    })

    function addAnimation(event, element) {
        let posX = event.offsetX
        let posY = event.offsetY
        element.style.setProperty('--x', posX + 'px')
        element.style.setProperty('--y', posY + 'px')
    }

}