window.getMissions = function(l, m, r) {
    function range(s, e) { var a=[]; for(var i=s;i<=e;i++) a.push(i); return a; }
    var t = [];
    if (l === 19) t = [1, 2];
    else if (l === 12) t = range(3, 21);
    else if (l === 5) t = range(22, 39);
    else if (l === 6) t = [40].concat(range(41, 50));
    else if (l === 10) t = range(51, 61);
    else if (l === 17) t = range(62, 71);
    else if (l === 1) t = range(72, 77);
    else if (l === 21) t = range(78, 85);
    else if (l === 18) t = range(86, 89);
    else if (l === 9) t = range(90, 91);
    else if (l === 8) t = range(92, 100);
    else if (l === 16) t = range(101, 102);
    else if (l === 20) t = [103];
    else if (l === 13) t = [104];
    else if (l === 4) t = [105];
    if (m === 9) t.push(106);
    if (m === 18) t.push(107);
    if (m === 6) t.push(109);
    return t;
};

window.addEventListener('load', function() {
    var done = JSON.parse(localStorage.getItem('thunder_completed')) || [];
    var boxes = [document.getElementById("leftReelBox"), document.getElementById("midReelBox"), document.getElementById("rightReelBox")];
    var container = document.getElementById("collectionCards"), modal = document.getElementById("modal"), modalContent = document.getElementById("modalContent");

    function openModal() { modal.style.display = "flex"; document.body.style.overflow = 'hidden'; history.pushState({modal: true}, ""); }
    window.closeModal = function() { if (modal.style.display === "flex") history.back(); };
    window.addEventListener('popstate', function(e) { modal.style.display = "none"; document.body.style.overflow = ''; });
    window.toggleLock = function(idx) {
        var checkbox = [document.getElementById("checkLeft"), document.getElementById("checkMid"), document.getElementById("checkRight")][idx];
        boxes[idx].style.overflowY = checkbox.checked ? "hidden" : "scroll";
    };

    function save() { localStorage.setItem('thunder_completed', JSON.stringify(done)); }
    function fmt(n) { return String(n).padStart(2, '0'); }

    window.showModal = function(src) { modalContent.innerHTML = '<img src="'+src+'" class="modal-img"><button onclick="closeModal()" style="width:100%;padding:10px;margin-top:10px;">閉じる</button>'; openModal(); };

    function bldItem(i) {
        var f = 'no' + fmt(i) + '.jpg', has = done.includes(i);
        return '<div style="text-align:center;border:2px solid '+(has?'#ff7b00':'#444')+';padding:5px;border-radius:5px;" onclick="handleToggle('+i+')"><img src="'+f+'" style="width:100%;opacity:'+(has?'1':'0.5')+';"><p style="margin:5px 0;font-size:12px;">No.'+fmt(i)+(has?' ✓':'')+'</p></div>';
    }

    window.handleToggle = function(n) {
        done = done.includes(n) ? done.filter(function(v){return v!==n;}) : done.concat(n); save(); update();
        var mode = modalContent.getAttribute("data-type");
        if(mode === "all") showAllMissionsModal(parseInt(modalContent.getAttribute("data-page")));
        else if(mode === "unlearn") showUnlearnedModal();
        else if(mode === "spec") showSpecialModal();
    };

    function buildNav(currentPage) {
        var pages = [1, 41, 81, 121];
        var html = '<div style="display:flex; gap:5px; margin-bottom:10px;">';
        pages.forEach((p, idx) => {
            var pageNum = idx + 1;
            html += '<button onclick="showAllMissionsModal('+pageNum+')" style="flex:1; padding:8px; background:'+(currentPage===pageNum?'#ff7b00':'#444')+'; border:none; color:white; border-radius:4px;">No.'+p+'~</button>';
        });
        return html + '</div>';
    }

    window.showAllMissionsModal = function(page) {
        modalContent.setAttribute("data-type", "all");
        modalContent.setAttribute("data-page", page);
        var nav = buildNav(page);
        var start = (page - 1) * 40 + 1, end = Math.min(page * 40, 150);
        
        modalContent.innerHTML = '<h3 style="text-align:center;">全リーチ目一覧</h3>' + nav + '<div id="listGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>' + nav + '<button onclick="closeModal()" style="width:100%;padding:10px;margin-top:10px;">閉じる</button>';
        var g = document.getElementById("listGrid");
        for(var i = start; i <= end; i++) g.innerHTML += bldItem(i);
        openModal();
    };

    window.showUnlearnedModal = function() {
        modalContent.setAttribute("data-type", "unlearn");
        modalContent.innerHTML = '<h3 style="text-align:center;">未習得一覧</h3><button onclick="closeModal()" style="width:100%;padding:10px;margin-bottom:10px;">閉じる</button><div id="listGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>';
        var g = document.getElementById("listGrid");
        for(var i = 1; i <= 150; i++) { if(!done.includes(i)) g.innerHTML += bldItem(i); }
        openModal();
    };

    window.showSpecialModal = function() {
        modalContent.setAttribute("data-type", "spec");
        modalContent.innerHTML = '<h3 style="text-align:center;">特殊 (110~150)</h3><button onclick="closeModal()" style="width:100%;padding:10px;margin-bottom:10px;">閉じる</button><div id="listGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>';
        var g = document.getElementById("listGrid");
        for(var i = 110; i <= 150; i++) g.innerHTML += bldItem(i);
        openModal();
    };

    function getPos(b) {
        var img = b.querySelector("img"); if (!img || img.offsetHeight === 0) return 1;
        return (21 - Math.round(b.scrollTop / (img.offsetHeight / 21)) % 21) % 21 + 1;
    }

    function update() {
        var l = getPos(boxes[0]), m = getPos(boxes[1]), r = getPos(boxes[2]);
        document.getElementById("reelPos").innerText = 'L:' + l + ' | M:' + m + ' | R:' + r;
        document.getElementById("progressDisplay").innerText = '達成状況: ' + done.length + '/150';
        container.innerHTML = '';
        var t = window.getMissions(l, m, r);
        t.filter(function(n){return !done.includes(n);}).forEach(function(i) {
            var f = 'no' + fmt(i) + '.jpg';
            container.innerHTML += '<div class="card"><img src="'+f+'" style="width:110px;height:auto;object-fit:contain;border-radius:4px;margin-right:12px;cursor:pointer;" onclick="showModal(\''+f+'\')"><div style="flex-grow:1;"><div class="card-no">No.'+fmt(i)+'</div></div><button onclick="markAsComplete('+i+')" style="background:#ff7b00;border:none;color:white;padding:5px 10px;border-radius:4px;flex-shrink:0;">確定</button></div>';
        });
    }

    window.markAsComplete = function(n) { if(!done.includes(n)) done.push(n); save(); update(); };
    boxes.forEach(function(b) { b.addEventListener("scroll", update); });
    setTimeout(update, 500);
});