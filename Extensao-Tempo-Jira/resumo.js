document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('container-relatorio');
  const btnZerar = document.getElementById('btn-zerar');

  function formatarDuracao(ms) {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    
    if (horas > 0) return `${horas}h ${minutos}m ${segundos}s`;
    if (minutos > 0) return `${minutos}m ${segundos}s`;
    return `${segundos}s`;
  }

  function formatarJira(ms) {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);

    let parts = [];
    if (horas > 0) parts.push(`${horas}h`);
    if (minutos > 0) parts.push(`${minutos}m`);
    return parts.length > 0 ? parts.join(' ') : '1m';
  }

  function formatarHora(timestamp) {
    const data = new Date(timestamp);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatarDataCabecalho(dataString) {
    const partes = dataString.split('/');
    const dataAlvo = new Date(partes[2], partes[1] - 1, partes[0]);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    if (dataAlvo.toDateString() === hoje.toDateString()) return 'Hoje';
    if (dataAlvo.toDateString() === ontem.toDateString()) return 'Ontem';
    
    return dataAlvo.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
  }

  function renderizarRelatorio(historico) {
    container.innerHTML = '';
    const nomesGrupos = Object.keys(historico);

    if (nomesGrupos.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum tempo registrado nos grupos ainda.</div>';
      return;
    }

    const diasMap = {};
    let temSessaoValida = false;

    nomesGrupos.forEach(nome => {
      historico[nome].forEach(sessao => {
        if (sessao.duracao >= 10000) { 
          temSessaoValida = true;
          const dataFormatada = new Date(sessao.inicio).toLocaleDateString('pt-BR');
          
          if (!diasMap[dataFormatada]) diasMap[dataFormatada] = {};
          if (!diasMap[dataFormatada][nome]) diasMap[dataFormatada][nome] = [];
          
          diasMap[dataFormatada][nome].push(sessao);
        }
      });
    });

    if (!temSessaoValida) {
      container.innerHTML = '<div class="empty-state">As únicas sessões registradas foram muito curtas (menos de 10s) e foram ocultadas.</div>';
      return;
    }

    const datasOrdenadas = Object.keys(diasMap).sort((a, b) => {
      return new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'));
    });

    datasOrdenadas.forEach(dataKey => {
      const divDia = document.createElement('div');
      divDia.className = 'divisor-dia';
      divDia.innerText = formatarDataCabecalho(dataKey).toUpperCase();
      container.appendChild(divDia);

      const gruposDoDia = diasMap[dataKey];
      
      Object.keys(gruposDoDia).forEach(nome => {
        const sessoes = gruposDoDia[nome];
        
        const horaMaisAntiga = Math.min(...sessoes.map(s => s.inicio));
        const horaMaisRecente = Math.max(...sessoes.map(s => s.fim));
        const periodoGeral = `Das ${formatarHora(horaMaisAntiga)} às ${formatarHora(horaMaisRecente)}`;
        
        const tempoTotalMs = horaMaisRecente - horaMaisAntiga;
        const tempoJira = formatarJira(tempoTotalMs);

        const grupoContainer = document.createElement('div');
        grupoContainer.className = 'grupo-container';

        const cabecalhoHtml = document.createElement('div');
        cabecalhoHtml.className = 'linha-cabecalho';
        
        cabecalhoHtml.innerHTML = `
          <div class="bloco-esquerda">
            <svg class="seta-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span class="texto-registro" style="display: flex; align-items: center;">
              <strong>${nome}</strong>
              <span class="texto-secundario" style="margin-left: 8px; font-weight: normal; display: flex; align-items: center; gap: 6px;">
                (${periodoGeral}) - ${tempoJira}
                <svg class="btn-copiar-tempo" title="Copiar tempo para o Jira" width="14" height="14" style="cursor: pointer; color: #0052cc; padding: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </span>
            </span>
          </div>
          <div class="bloco-direita">
            <div class="valor-total">${formatarDuracao(tempoTotalMs)}</div>
            <div class="acoes-container">
              <span class="link-detalhes">Mais detalhes</span>
              <svg class="icon-acao btn-excluir-grupo" style="cursor: pointer;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
          </div>
        `;

        const conteudoExpandido = document.createElement('div');
        conteudoExpandido.className = 'conteudo-expandido';

        sessoes.forEach(sessao => {
          const duracaoSessaoReal = sessao.fim - sessao.inicio;
          const linhaSessao = document.createElement('div');
          linhaSessao.className = 'sessao-linha';
          linhaSessao.innerHTML = `
            <span>Das ${formatarHora(sessao.inicio)} às ${formatarHora(sessao.fim)}</span>
            <span>Duração: ${formatarDuracao(duracaoSessaoReal)}</span>
          `;
          conteudoExpandido.appendChild(linhaSessao);
        });

        cabecalhoHtml.addEventListener('click', () => {
          const seta = cabecalhoHtml.querySelector('.seta-svg');
          conteudoExpandido.classList.toggle('visivel');
          seta.classList.toggle('aberta');
        });

        const btnCopiar = cabecalhoHtml.querySelector('.btn-copiar-tempo');
        btnCopiar.addEventListener('click', (evento) => {
          evento.stopPropagation(); 
          navigator.clipboard.writeText(tempoJira);
          const iconOriginal = btnCopiar.innerHTML;
          btnCopiar.style.color = '#2b9564'; 
          btnCopiar.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
          setTimeout(() => {
            btnCopiar.style.color = '#0052cc'; 
            btnCopiar.innerHTML = iconOriginal;
          }, 1500);
        });

        const btnLixeira = cabecalhoHtml.querySelector('.btn-excluir-grupo');
        btnLixeira.addEventListener('click', async (evento) => {
          evento.stopPropagation(); 
          if (confirm(`Deseja realmente excluir os apontamentos de "${nome}" referentes ao dia ${dataKey}?`)) {
            const dadosAtuais = await chrome.storage.local.get(['historicoGrupos']);
            const historicoAtualizado = dadosAtuais.historicoGrupos || {};
            
            historicoAtualizado[nome] = historicoAtualizado[nome].filter(s => {
              return new Date(s.inicio).toLocaleDateString('pt-BR') !== dataKey;
            });

            if (historicoAtualizado[nome].length === 0) {
              delete historicoAtualizado[nome];
            }

            await chrome.storage.local.set({ historicoGrupos: historicoAtualizado });
            renderizarRelatorio(historicoAtualizado);
          }
        });

        grupoContainer.appendChild(cabecalhoHtml);
        grupoContainer.appendChild(conteudoExpandido);
        container.appendChild(grupoContainer);
      });
    });
  }

  const data = await chrome.storage.local.get(['historicoGrupos']);
  renderizarRelatorio(data.historicoGrupos || {});

  btnZerar.addEventListener('click', async () => {
    if (confirm("Deseja realmente apagar TODO o histórico de apontamentos de todos os grupos?")) {
      await chrome.storage.local.set({ historicoGrupos: {} });
      renderizarRelatorio({});
    }
  });
});