// Change <select>'s option and trigger events with JavaScript
// https://stackoverflow.com/questions/19329978/change-selects-option-and-trigger-events-with-javascript
function selectButton(select, button, opt1, document) {
    console.log("enabling events for select: " + select + " and button " + button);
    var sel = document.getElementById(select);
    var btn = document.getElementById(button);
    var opt = document.getElementById(opt1);

    btn.addEventListener('click', function (e) {

    // firing the event properly according to StackOverflow
    // http://stackoverflow.com/questions/2856513/how-can-i-trigger-an-onchange-event-manually
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");

        evt.initEvent("change", false, true);
        sel.dispatchEvent(evt);
    } else {
        sel.fireEvent("onchange");
        }
    });

    sel.addEventListener("change", function (e) {
        btn.disabled = false;
        opt.disabled = true;
    });
}

function textBoxButton(textBox, button, context, document) {
    console.log("enabling events for select: " + textBox + " and button " + button);
    var tBox = document.getElementById(textBox);
    var btn = document.getElementById(button);

    btn.addEventListener('click', function (e) {

    // firing the event properly according to StackOverflow
    // http://stackoverflow.com/questions/2856513/how-can-i-trigger-an-onchange-event-manually
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");

        evt.initEvent("change", false, true);
        tBox.dispatchEvent(evt);
    } else {
        tBox.fireEvent("onchange");
        }
    });

    tBox.addEventListener("change", function (e) {
        var truthy = false;
        if (context.hasOwnProperty(tBox.value)) {
            truthy = true;
        }
        if (tBox.value == ""){ truthy = true; }
        if (!truthy) {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    });
}
