export function scrollAnim() {

    var slideUp = {
        distance: '50%',
        origin: 'bottom',
        opacity: 0.3,
        delay: 200
    };
    var interval = {
        interval: 200,
        delay: 200
    }
    var opacity = {
        distance: '6%',
        delay: 200,
        opacity: 0.5
    }

    ScrollReveal().reveal('.slide-up', slideUp);
    ScrollReveal().reveal('.opacity', opacity);
    ScrollReveal().reveal('.seq > *', interval);
    ScrollReveal().reveal('.seqitem', interval);
}