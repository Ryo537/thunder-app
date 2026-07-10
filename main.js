window.addEventListener('load', function() {
    var done = JSON.parse(localStorage.getItem('thunder_completed')) || [];
    var boxes = [document.getElementById("leftReelBox"), document.getElementById("midReelBox"), document.getElementById("rightReelBox")];
    var container = document.getElementById("collectionCards"), modal = document.getElementById("modal"), modalContent = document.getElementById("modalContent");
    var curPage = 1;

    function save() { localStorage.setItem('thunder_completed', JSON.stringify(done)); }
    function fmt(n) { return String(n).padStart(2, '0'); }

    window.closeModal = function() {
        modal.style.display = 'none';
        if (history.state === 'modal-open') {
            history.back();
        }
    };

    window.addEventListener('popstate', function(e) {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });

    function pushModalState() {
        if (history.state !== 'modal-open') {
            history.pushState('modal-open', null, '');
        }
    }

    window.showModal = function(src) { 
        modalContent.innerHTML = '<img src="'+src+'">'; 
        modal.style.display = "flex"; 
        pushModalState();
    };

    function bldItem(i) {
        var f = 'no' + fmt(i) + '.jpg', has = done.includes(i);
        return '<div style="text-align:center;border:2px solid '+(has?'#ff7b00':'#444')+';padding:5px;border-radius:5px;" onclick="handleToggle('+i+')"><img src="'+f+'" style="width:100%;opacity:'+(has?'1':'0.5')+';"><p style="margin:5px 0;font-size:12px;">No.'+fmt(i)+(has?' ✓':'')+'</p></div>';
    }

    window.handleToggle = function(n) {
        done = done.includes(n) ? done.filter(function(v){return v!==n;}) : done.concat(n); save(); update();
        var t = modalContent.getAttribute("data-type");
        if(t==="all") showAllMissionsModal(null, true); 
        if(t==="unlearn") showUnlearnedModal(true); 
        if(t==="spec") showSpecialModal(true);
    };

    window.showAllMissionsModal = function(p, noReset) {
        if (p) curPage = p; modalContent.setAttribute("data-type", "all");
        
        function bldNav() {
            var btnHtml = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:10px 0;">';
            [1, 41, 81, 121].forEach(function(s, idx) {
                btnHtml += '<button onclick="showAllMissionsModal('+(idx+1)+')" style="padding:6px 2px;font-size:11px;font-weight:bold;background:'+(curPage===(idx+1)?'#ff7b00':'#444')+';color:white;border:none;border-radius:4px;">No.'+s+'~</button>';
            });
            btnHtml += '</div>';
            return btnHtml;
        }

        var h = '<h3 style="text-align:center;margin-bottom:10px;">全リーチ目一覧</h3>';
        h += '<button onclick="closeModal()" style="width:100%;padding:10px;background:#444;border:none;color:white;border-radius:5px;">閉じる</button>';
        h += bldNav();
        h += '<div id="listGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>';
        h += bldNav();
        h += '<button onclick="closeModal()" style="width:100%;margin-top:10px;padding:10px;background:#444;border:none;color:white;border-radius:5px;">閉じる</button>';
        
        modalContent.innerHTML = h;
        var g = document.getElementById("listGrid"), start = [1, 41, 81, 121][curPage-1], end = [40, 80, 120, 150][curPage-1];
        for(var i = start; i <= end; i++) g.innerHTML += bldItem(i);
        modal.style.display = "flex";
        pushModalState();

        if (!noReset) modalContent.scrollTop = 0;
    };

    window.showUnlearnedModal = function(noReset) {
        modalContent.setAttribute("data-type", "unlearn");
        var h = '<h3 style="text-align:center;margin-bottom:10px;">未習得一覧</h3>';
        h += '<button onclick="closeModal()" style="width:100%;margin-bottom:15px;padding:10px;background:#444;border:none;color:white;border-radius:5px;">閉じる</button>';
        h += '<div id="listGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:60vh;overflow-y:auto;"></div>';
        h += '<button onclick="closeModal()" style="width:100%;margin-top:20px;padding:10px;background:#444;border:none;color:white;border-radius:5px;">閉じる</button>';
        
        modalContent.innerHTML = h;
        var g = document.getElementById("listGrid"), c = 0;
        for(var i = 1; i <= 150; i++) { if(!done.includes(i)) { g.innerHTML += bldItem(i); c++; } }
        if(c === 0) g.innerHTML = '<p style="grid-column:1/3;text-align:center;padding:20px;color:#aaa;">🎉 全達成！</p>';
        modal.style.display = "flex";
        pushModalState();
        if (!noReset) modalContent.scrollTop = 0;
    };

    window.showSpecialModal = function(noReset) {
        modalContent.setAttribute("data-type", "spec");
        var h = '<h3 style="text-align:center;margin-bottom:10px;">特殊 (110~150)</h3>';
        h += '<button onclick="closeModal()" style="width:100%;margin-bottom:15px;padding:10px;background:#444;border:none;color:white;border-radius:5px;">閉じる</button>';
        h += '<div id="listGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:60vh;overflow-y:auto;"></div>';
        h += '<button onclick="closeModal()" style="width:100%;margin-top:20px;padding:10px;background:#444;border:none;color:white;border-radius:5px;">閉じる</button>';
        
        modalContent.innerHTML = h;
        var g = document.getElementById("listGrid");
        for(var i = 110; i <= 150; i++) g.innerHTML += bldItem(i);
        modal.style.display = "flex";
        pushModalState();
        if (!noReset) modalContent.scrollTop = 0;
    };

    window.markAsComplete = function(n) { if(!done.includes(n)) done.push(n); save(); update(); };

    function getPos(b) {
        var img = b.querySelector("img"); if (!img || img.offsetHeight === 0) return 1;
        return (21 - Math.round(b.scrollTop / (img.offsetHeight / 21)) % 21) % 21 + 1;
    }

    function update() {
        var l = getPos(boxes[0]), m = getPos(boxes[1]), r = getPos(boxes[2]);
        container.innerHTML = '<div style="font-size:12px;color:#aaa;margin-bottom:10px;">L:'+l+' | M:'+m+' | r:'+r+'</div>';
        
        var t = window.getMissions ? window.getMissions(l, m, r) : [];

        t.filter(function(n){return !done.includes(n);}).forEach(function(i) {
            var f = 'no' + fmt(i) + '.jpg';
            // 画像サイズを幅110px、高さオート、アスペクト比維持に変更しました
            container.innerHTML += '<div class="card"><img src="'+f+'" style="width:110px;height:auto;object-fit:contain;border-radius:4px;margin-right:12px;cursor:pointer;" onclick="showModal(\''+f+'\')"><div style="flex-grow:1;"><div class="card-no">No.'+fmt(i)+'</div><div>判定中...</div></div><button onclick="markAsComplete('+i+')" style="background:#ff7b00;border:none;color:white;padding:5px 10px;border-radius:4px;flex-shrink:0;">確定</button></div>';
        });
    }

    boxes.forEach(function(b) { b.addEventListener("scroll", update); });
    setTimeout(update, 300);
});