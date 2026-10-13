async function getEstadoAtual() {
  const data = await chrome.storage.local.get(['estadoAtual']);
  return data.estadoAtual || { activeGroupId: chrome.tabGroups.TAB_GROUP_ID_NONE, startTime: Date.now() };
}

async function setEstadoAtual(groupId) {
  await chrome.storage.local.set({ 
    estadoAtual: { activeGroupId: groupId, startTime: Date.now() } 
  });
}

async function registrarSessao() {
  const estado = await getEstadoAtual();
  
  if (estado.activeGroupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
    const endTime = Date.now();
    const duration = endTime - estado.startTime;

    if (duration >= 10000) {
      const data = await chrome.storage.local.get(['historicoGrupos']);
      const historico = data.historicoGrupos || {};

      try {
        const group = await chrome.tabGroups.get(estado.activeGroupId);
        const groupName = group.title || 'Grupo (Sem Nome)';

        if (!historico[groupName]) historico[groupName] = [];
        
        historico[groupName].push({
          inicio: estado.startTime,
          fim: endTime,
          duracao: duration
        });

        await chrome.storage.local.set({ historicoGrupos: historico });
      } catch (e) {}
    }
  }
  chrome.action.setBadgeText({ text: "" });
}

chrome.alarms.create("relogioTempoReal", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "relogioTempoReal") {
    const estado = await getEstadoAtual();
    
    if (estado.activeGroupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      const minutos = Math.floor((Date.now() - estado.startTime) / 60000);
      
      if (minutos > 0) {
        chrome.action.setBadgeText({ text: `${minutos}m` });
        chrome.action.setBadgeBackgroundColor({ color: "#2b9564" });
        
        const abas = await chrome.tabs.query({ active: true, currentWindow: true });
        const abaAtiva = abas[0];
        
        if (abaAtiva && abaAtiva.url && !abaAtiva.url.startsWith('chrome://')) {
          chrome.scripting.executeScript({
            target: { tabId: abaAtiva.id },
            func: (min) => {
              try {
                const tituloLimpo = document.title.replace(/^\(\d+m\)\s*/, '');
                document.title = `(${min}m) ${tituloLimpo}`;
              } catch(e) {}
            },
            args: [minutos]
          }).catch(() => {});
        }
      }
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await registrarSessao(); 
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await setEstadoAtual(tab.groupId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.groupId !== undefined) {
    await registrarSessao();
    await setEstadoAtual(changeInfo.groupId);
  }
});

chrome.action.onClicked.addListener(async () => {
  await registrarSessao(); 
  const abas = await chrome.tabs.query({ active: true, currentWindow: true });
  const abaAtual = abas[0];
  await setEstadoAtual(abaAtual ? abaAtual.groupId : chrome.tabGroups.TAB_GROUP_ID_NONE);
  chrome.tabs.create({ url: 'resumo.html' });
});

chrome.idle.setDetectionInterval(900);

chrome.idle.onStateChanged.addListener(async (newState) => {
  if (newState === "idle" || newState === "locked") {
    await registrarSessao();
    await setEstadoAtual(chrome.tabGroups.TAB_GROUP_ID_NONE);
  
    chrome.action.setBadgeText({ text: "AFK" });
    chrome.action.setBadgeBackgroundColor({ color: "#b48312" });
    
  } else if (newState === "active") {
    
    const abas = await chrome.tabs.query({ active: true, currentWindow: true });
    if (abas.length > 0) {
      await setEstadoAtual(abas[0].groupId);
    }
  }
});