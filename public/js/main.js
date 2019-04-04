
$(document).ready(function () {
    
    // let socket = io();
     let siteLink = 'https://gentle-everglades-93024.herokuapp.com/';

    // let bagliOyuncu = 0;

    //GÖRSEL VE DİĞER İŞLEMLER //
    $("#1v1FastBall").click(() => {
        window.location.assign(siteLink + '/1V1FASTBALL');
    });
});
