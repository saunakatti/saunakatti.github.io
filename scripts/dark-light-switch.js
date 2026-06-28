var r = document.querySelector(':root');
var rs = getComputedStyle(r)

function themeSwitchClick() {
    var baseColor = rs.getPropertyValue('--color-base')
    if (baseColor === "#1e1e2e") {
       r.style.setProperty('--color-base', '#eff1f5');
    } else {
        r.style.setProperty('--color-base', '#1e1e2e');
    }
}