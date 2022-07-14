
const getStar = (total) => {
    let stars = ''
    for (var i = total; i > 0; i--) {
        stars = stars + '⭐'
    }

    for (var i = 5 - total; i > 0; i--) {
        stars = stars + '-'
    }

    return stars
}

console.log(getStar(3))