(function() {
    var c = document.getElementById('c');
    var overlay = document.getElementById('overlay');
    var edits = document.getElementById('edits');
    var ctx = c.getContext('2d');
    var w, h;

    // autoscale-canvas
    function autoscale(canvas) {
        var ctx = canvas.getContext('2d');
        var ratio = window.devicePixelRatio || 1;
        if (1 != ratio) {
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
            canvas.width *= ratio;
            canvas.height *= ratio;
            ctx.scale(ratio, ratio);
        }
        return ctx;
    }

    function setSize() {
        w = window.innerWidth;
        h = w / 2;
        c.width = w;
        c.height = h;
        ctx = autoscale(c);
    }

    setSize();

    var id = '';

    var texts = [];
    for (var i = 0; i < 5; i++) {
        texts.push(overlay.appendChild(document.createElement('span')));
        texts[i].appendChild(document.createElement('a'));
        texts[i].childNodes[0].className = 'edit-link';
        texts[i].appendChild(document.createElement('a'));
    }

    var texti = 0;
    function setText(x, id, px) {
        texts[texti].style.webkitTransform = 'translate(' + px[0] + 'px,' + px[1] + 'px)';
        texts[texti].childNodes[0].innerHTML = '+';
        texts[texti].childNodes[0].href = 'http://openstreetmap.org/browse/changeset/' + id;
        texts[texti].childNodes[1].innerHTML = x;
        texts[texti].childNodes[1].href = 'http://openstreetmap.org/user/' + x;
        texti = (++texti > 4) ? 0 : texti;
    }

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#fff';

    function scale(p) {
        return [
            ~~((p[0] + 180) * (w / 360)),
            ~~(h - ((p[1] + 90) * (h / 180)))
        ];
    }

    function xhr(url, callback) {
        var x = new XMLHttpRequest();
        x.open("GET", url, true);
        x.onload = callback;
        x.send();
    }

    function refresh() {
        xhr('/changes', function() {
            var res = JSON.parse(this.responseText);
            if (res.id !== id) {
                draw(res.changes);
                id = res.id;
            }
        });
    }

    var edits_recorded = 0;

    function setEdits(e) {
        edits.innerHTML = edits_recorded;
    }

    function draw(points) {
        var i = 0;
        var persec = (60 * 1000) / points.length;
        function d() {
            ctx.globalAlpha = 1;
            var tl = scale(points[i].box[0]);
            var br = scale(points[i].box[1]);
            ctx.fillStyle = '#CCE9FF';
            ctx.fillRect(tl[0], tl[1],
                (br[0] - tl[0]) || 3,
                (br[1] - tl[1]) || 3);
            setText(points[i].user, points[i].id, tl);
            if (++i < points.length) window.setTimeout(d, persec);
            setEdits(edits_recorded++);
        }
        window.setTimeout(d, persec);
    }

    window.setInterval(refresh, 10 * 1000);
    refresh();
})();
