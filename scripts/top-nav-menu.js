function topNavClick() {
    
    var topNav = document.getElementById("navigation-bar");
    if (topNav.style.display !== "none") {
        topNav.style.display = "none";
    } else {
        topNav.style.display = "flex";
    }

    var menu = document.getElementById("menu")
    if (menu.style.display === "flex") {
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
    }
    
}