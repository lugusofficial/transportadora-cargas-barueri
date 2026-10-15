/* Comportamento da pagina: cabecalho sobre o video, reveal, simulador de veiculo com mapa de prazo,
   torre de controle de exemplo e cotacao montada no WhatsApp. Tudo progressivo: sem este arquivo
   a pagina continua legivel e o formulario ainda abre o WhatsApp. */
(function () {
  var D = window.DADOS;
  var M = window.MAPA_BR;
  var calma = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function (n) { return String(Math.round(n * 10) / 10).replace('.', ','); };

  /* Cabecalho transparente enquanto o video esta atras dele. */
  var header = document.querySelector('[data-header]');
  var cena = document.querySelector('.cena');
  if (header && cena) {
    var limite = 0;
    var medir = function () { limite = cena.getBoundingClientRect().bottom + window.scrollY - header.offsetHeight; };
    var avaliar = function () { header.classList.toggle('is-sobre', window.scrollY < limite - 10); };
    medir(); avaliar();
    window.addEventListener('scroll', avaliar, { passive: true });
    window.addEventListener('resize', function () { medir(); avaliar(); });
  }

  /* Video do topo: se o navegador recusar o autoplay (economia de bateria no iPhone), fica o poster. */
  var video = document.querySelector('[data-video]');
  if (video && video.play) {
    var tentativa = video.play();
    if (tentativa && tentativa.catch) { tentativa.catch(function () { video.hidden = true; }); }
  }

  /* Reveal: so com IntersectionObserver; sem ele tudo ja esta visivel. */
  if ('IntersectionObserver' in window && !calma) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add('is-visible'); io.unobserve(it.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-reveal], [data-reveal-filhos]').forEach(function (el) { io.observe(el); });
  }

  if (!D) { return; }

  /* Desenho do veiculo em escala: 10 unidades por metro, frente para a direita. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var desenhar = function (v, ocup) {
    var L = v.comp * 10, H = 46, chao = 40, r = 4.6;
    var p = [];
    var corpos = [];
    var rodas = [];
    if (v.tipo === 'rigido') {
      var alto = v.id === 'vuc' ? 12 : 6;
      corpos.push([0, L - 25]);
      p.push('<rect class="v-cabine" x="' + (L - 23) + '" y="12" width="23" height="24" rx="3"/>');
      p.push('<rect class="v-vidro" x="' + (L - 9) + '" y="15" width="7" height="8" rx="1.5"/>');
      p.push('<rect class="v-chassi" x="0" y="33" width="' + L + '" height="3"/>');
      rodas.push(L - 12);
      var tras = v.eixos - (v.id === 'bitruck' ? 2 : 1);
      if (v.id === 'bitruck') { rodas.push(L - 24); }
      for (var i = 0; i < tras; i++) { rodas.push(L * 0.22 + i * 11); }
      p.push('<rect class="v-bau" x="0" y="' + alto + '" width="' + (L - 25) + '" height="' + (34 - alto) + '" rx="2"/>');
      corpos[0].push(alto);
    } else {
      var cav = 62;
      p.push('<rect class="v-cabine" x="' + (L - 23) + '" y="10" width="23" height="26" rx="3"/>');
      p.push('<rect class="v-vidro" x="' + (L - 9) + '" y="13" width="7" height="8" rx="1.5"/>');
      p.push('<rect class="v-chassi" x="' + (L - cav) + '" y="33" width="' + cav + '" height="3"/>');
      rodas.push(L - 12, L - 42, L - 53);
      var n = v.tipo === 'carreta' ? 1 : 2;
      var util = L - cav + 12;
      var gap = 4;
      var cada = (util - gap * (n - 1)) / n;
      for (var k = 0; k < n; k++) {
        var x0 = k * (cada + gap);
        corpos.push([x0, cada, 4]);
        p.push('<rect class="v-bau" x="' + x0 + '" y="4" width="' + cada + '" height="28" rx="2"/>');
        p.push('<rect class="v-chassi" x="' + x0 + '" y="31" width="' + cada + '" height="3"/>');
        var eixosReboque = v.tipo === 'carreta' ? 3 : (v.tipo === 'bitrem' ? 2 : 3);
        for (var e = 0; e < eixosReboque; e++) { rodas.push(x0 + 8 + e * 10); }
        if (k > 0) { p.push('<rect class="v-chassi" x="' + (x0 - gap - 2) + '" y="32" width="' + (gap + 4) + '" height="2"/>'); }
      }
    }
    /* Ocupacao: preenche os corpos de tras para a frente. */
    var total = corpos.reduce(function (s, c) { return s + c[1]; }, 0);
    var resta = total * Math.max(0, Math.min(1, ocup));
    corpos.forEach(function (c) {
      var w = Math.min(c[1], resta);
      resta -= w;
      if (w > 0) { p.push('<rect class="v-carga" x="' + (c[0] + 1.5) + '" y="' + (c[2] + 1.5) + '" width="' + Math.max(0, w - 3) + '" height="' + (34 - c[2] - 5) + '" rx="1"/>'); }
    });
    rodas.forEach(function (x) { p.push('<circle class="v-roda" cx="' + x + '" cy="' + (chao - r + 1) + '" r="' + r + '"/>'); });
    p.push('<line class="v-chao" x1="-4" y1="' + (chao + 1.5) + '" x2="' + (L + 4) + '" y2="' + (chao + 1.5) + '"/>');
    return '<svg viewBox="-4 0 ' + (L + 8) + ' ' + H + '" style="--escala:' + Math.min(1, v.comp / 22).toFixed(2) + '" aria-hidden="true" focusable="false">' + p.join('') + '</svg>';
  };

  /* Indicacao: o menor veiculo que leva o peso e o volume. */
  var indicar = function (t, m3) {
    var vs = D.veiculos;
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i];
      if (v.m3 && t <= v.t && m3 <= v.m3) { return { v: v, ocup: Math.max(t / v.t, m3 / v.m3), por: t / v.t >= m3 / v.m3 ? 'peso' : 'volume' }; }
    }
    var carreta = vs[5];
    if (m3 > carreta.m3 && t <= carreta.t * 2) { return { v: carreta, ocup: 1, por: 'volume', nota: 'O volume pede duas carretas ou uma composição maior.' }; }
    for (var j = 6; j < vs.length; j++) {
      if (t <= vs[j].t) { return { v: vs[j], ocup: t / vs[j].t, por: 'peso', nota: 'Composição para granel; confirmamos rota e autorização na cotação.' }; }
    }
    return { v: vs[vs.length - 1], ocup: 1, por: 'peso', nota: 'Acima de 52 t: dividimos em mais de uma viagem.' };
  };

  var projetar = function (lon, lat) {
    return [(lon + 74.1) * 10 * Math.cos(15 * Math.PI / 180), (5.4 - lat) * 10];
  };

  var prazoTexto = function (uf) {
    var d = D.destinos[uf];
    if (!d) { return ''; }
    var km = d[4];
    var a = Math.ceil(km / 600), b = Math.ceil(km / 500);
    var dias = a === b ? a + (a === 1 ? ' dia' : ' dias') : a + ' a ' + b + ' dias';
    return d[1] + ', ' + uf + ': cerca de ' + km.toLocaleString('pt-BR') + ' km, ' + dias + ' de viagem' + (d[5] ? ', com trecho de balsa' : '') + '.';
  };

  var sim = document.querySelector('[data-simulador]');
  var estado = { uf: 'PR', ind: null };
  if (sim) {
    var peso = sim.querySelector('#sim-peso');
    var vol = sim.querySelector('#sim-volume');
    var sel = sim.querySelector('[data-destino]');
    var mapa = sim.querySelector('[data-mapa]');
    var nomeEl = sim.querySelector('[data-nome]');
    var desenhoEl = sim.querySelector('[data-desenho]');
    var barra = sim.querySelector('[data-barra]');
    var ocupEl = sim.querySelector('[data-ocupacao]');
    var prazoEl = sim.querySelector('[data-prazo]');

    var ufs = Object.keys(D.destinos).sort(function (a, b) { return D.destinos[a][0].localeCompare(D.destinos[b][0], 'pt-BR'); });
    sel.innerHTML = ufs.map(function (uf) { return '<option value="' + uf + '"' + (uf === 'PR' ? ' selected' : '') + '>' + D.destinos[uf][0] + '</option>'; }).join('');

    var rota = null, alvo = null;
    if (M && mapa) {
      var svg = '<svg viewBox="' + M.viewBox + '" focusable="false">';
      Object.keys(M.ufs).forEach(function (uf) { svg += '<path class="uf" data-uf="' + uf + '" d="' + M.ufs[uf] + '"/>'; });
      svg += '<path class="rota" data-rota pathLength="1" d=""/>';
      svg += '<circle class="alvo" data-alvo r="5" cx="0" cy="0"/>';
      svg += '<circle class="origem" r="5" cx="' + M.origem[0] + '" cy="' + M.origem[1] + '"/>';
      svg += '</svg>';
      mapa.innerHTML = svg;
      rota = mapa.querySelector('[data-rota]');
      alvo = mapa.querySelector('[data-alvo]');
      mapa.addEventListener('click', function (ev) {
        var uf = ev.target.getAttribute && ev.target.getAttribute('data-uf');
        if (uf && D.destinos[uf]) { sel.value = uf; atualizar(); }
      });
    }

    var atualizar = function () {
      var t = Math.max(0.1, parseFloat(String(peso.value).replace(',', '.')) || 0.1);
      var m3 = Math.max(1, parseFloat(String(vol.value).replace(',', '.')) || 1);
      var ind = indicar(t, m3);
      estado.ind = ind; estado.uf = sel.value;
      var pct = Math.round(ind.ocup * 100);
      nomeEl.innerHTML = '<strong>' + ind.v.nome + '</strong> <span>' + ind.v.uso + '. Até ' + fmt(ind.v.t) + ' t' + (ind.v.m3 ? ' e ' + ind.v.m3 + ' m³' : '') + '.</span>';
      desenhoEl.innerHTML = desenhar(ind.v, ind.ocup);
      barra.style.width = pct + '%';
      ocupEl.textContent = ind.nota ? ind.nota : 'Você usa ' + pct + '% da capacidade, limitado pelo ' + ind.por + '.' + (pct < 40 ? ' Sobra espaço: na cotação avaliamos carga casada.' : '');
      prazoEl.textContent = prazoTexto(sel.value);
      if (rota && alvo) {
        var d = D.destinos[sel.value];
        var b = projetar(d[2], d[3]);
        var a = M.origem;
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var dx = b[0] - a[0], dy = b[1] - a[1];
        var c = [mx - dy * 0.25, my + dx * 0.25];
        mapa.querySelectorAll('.uf.is-ativa').forEach(function (el) { el.classList.remove('is-ativa'); });
        var ativa = mapa.querySelector('[data-uf="' + sel.value + '"]');
        if (ativa) { ativa.classList.add('is-ativa'); }
        alvo.setAttribute('cx', b[0].toFixed(1)); alvo.setAttribute('cy', b[1].toFixed(1));
        rota.classList.remove('is-desenhada');
        rota.setAttribute('d', 'M' + a[0] + ' ' + a[1] + 'Q' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1));
        void rota.getBoundingClientRect();
        rota.classList.add('is-desenhada');
      }
    };
    sim.addEventListener('input', atualizar);
    sim.addEventListener('change', atualizar);
    sim.addEventListener('submit', function (ev) { ev.preventDefault(); });
    atualizar();

    var levar = sim.querySelector('[data-levar]');
    if (levar) {
      levar.addEventListener('click', function () {
        var d = D.destinos[sel.value];
        var set = function (id, v) { var el = document.getElementById(id); if (el) { el.value = v; } };
        set('c-peso', peso.value);
        set('c-volume', vol.value);
        set('c-destino', d[1] + ', ' + sel.value);
      });
    }
  }

  /* Torre de controle: viagem de exemplo, com marcos conforme o nivel escolhido. */
  var painel = document.querySelector('[data-painel]');
  var niveis = document.querySelector('[data-niveis]');
  if (painel && niveis) {
    var feed = painel.querySelector('[data-feed]');
    var caminhao = painel.querySelector('[data-caminhao]');
    var textoNivel = document.querySelector('[data-nivel-texto]');
    var timers = [];
    var nivelAtual = function () { var r = niveis.querySelector('input:checked'); return r ? r.value : 'essencial'; };
    var tocar = function (instantaneo) {
      timers.forEach(clearTimeout); timers = [];
      var n = D.ordemNiveis.indexOf(nivelAtual());
      var marcos = D.marcos.filter(function (m) { return D.ordemNiveis.indexOf(m.nivel) <= n; });
      feed.innerHTML = '';
      caminhao.style.left = '0%';
      marcos.forEach(function (m, i) {
        var mostrar = function () {
          var li = document.createElement('li');
          li.className = 'painel__marco' + (m.nivel !== 'essencial' ? ' painel__marco--extra' : '');
          li.innerHTML = '<span class="painel__hora">' + m.hora + '</span><strong>' + m.titulo + '</strong><span>' + m.texto + '</span>';
          feed.appendChild(li);
          caminhao.style.left = (m.pos * 100) + '%';
          requestAnimationFrame(function () { li.classList.add('is-on'); });
        };
        if (calma || instantaneo === true) { mostrar(); } else { timers.push(setTimeout(mostrar, 250 + i * 900)); }
      });
    };
    niveis.addEventListener('change', function () {
      if (textoNivel) { textoNivel.textContent = D.niveis[nivelAtual()]; }
      tocar();
    });
    painel.querySelector('[data-repetir]').addEventListener('click', function () { tocar(); });
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (itens) {
        if (itens[0].isIntersecting) { obs.disconnect(); tocar(); }
      }, { threshold: 0.35 });
      tocar(true);
      obs.observe(painel);
    } else { tocar(true); }
  }

  /* Cotacao: monta a mensagem e abre o WhatsApp. */
  var cot = document.querySelector('[data-cotacao]');
  if (cot) {
    cot.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var invalido = cot.querySelector(':invalid');
      if (invalido) { invalido.focus(); if (cot.reportValidity) { cot.reportValidity(); } return; }
      var v = function (n) { var el = cot.elements[n]; return el && el.value ? el.value.trim() : ''; };
      var linhas = ['Olá! Quero uma cotação de frete.', 'Coleta: ' + v('origem'), 'Entrega: ' + v('destino')];
      if (v('peso')) { linhas.push('Peso: ' + v('peso') + ' t'); }
      if (v('volume')) { linhas.push('Volume: ' + v('volume') + ' m³'); }
      if (v('carga')) { linhas.push('Carga: ' + v('carga')); }
      if (estado.ind && v('peso')) { linhas.push('Veículo sugerido pelo site: ' + estado.ind.v.nome); }
      window.open(cot.getAttribute('action') + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
    });
  }
})();
