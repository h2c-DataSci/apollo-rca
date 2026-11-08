import { MODEL_CONFIG } from './ai-config.js';
import { RECOMMENDED_LOCAL_MODELS } from './local-ai-bridge.js?v=21';

export function openBrowserAiDialog() {
  let dialog = document.getElementById('h2c-browser-ai-dialog');
  if (!dialog) {
    dialog = document.createElement('aside');
    dialog.id = 'h2c-browser-ai-dialog';
    dialog.className = 'h2c-browser-ai-dialog';
    dialog.setAttribute('role', 'region');
    dialog.setAttribute('aria-labelledby', 'h2c-browser-ai-title');
    const title = document.createElement('h2');
    title.id = 'h2c-browser-ai-title';
    title.textContent = 'Browser AI';
    const body = document.createElement('div');
    body.className = 'body';
    const lead = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = MODEL_CONFIG.id;
    lead.append('Only ', strong, ' runs inside this browser. It is an ONNX q4 model, about 790 MB, under Apache-2.0. The page loads it in a worker and uses WebGPU, or WASM if the browser has no WebGPU. Your case text stays on this device.');
    const other = document.createElement('p');
    other.append('A browser cannot start Ollama or run GGUF weights. Gemma 2 (2B), Qwen 2.5 (1.5B), and Llama 3.2 (1B) stay on your computer. Install Ollama, then run one of these, and leave the endpoint at ');
    const endpoint = document.createElement('code');
    endpoint.textContent = 'http://127.0.0.1:11434';
    other.append(endpoint, '. Use Test Connection on the Local AI card.');
    const list = document.createElement('ul');
    RECOMMENDED_LOCAL_MODELS.forEach((model) => {
      const item = document.createElement('li');
      const code = document.createElement('code');
      code.textContent = model.cmd;
      item.append(model.name + ': ', code);
      list.append(item);
    });
    const status = document.createElement('p');
    status.className = 'h2c-browser-ai-status';
    status.setAttribute('role', 'status');
    const row = document.createElement('div');
    row.className = 'row';
    const go = document.createElement('button');
    go.type = 'button';
    go.className = 'go';
    go.textContent = 'Download and run in this browser';
    const stop = document.createElement('button');
    stop.type = 'button';
    stop.className = 'stop';
    stop.textContent = 'Close';
    const close = () => { dialog.hidden = true; };
    stop.onclick = close;
    go.onclick = () => startBrowserModel(dialog);
    row.append(go, stop);
    body.append(lead, other, list, status, row);
    dialog.append(title, body);
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    document.body.append(dialog);
  }
  const status = dialog.querySelector('.h2c-browser-ai-status');
  const coach = document.querySelector('section[aria-label="RCA coach"]');
  const ready = coach && /AI Ready|AI Working|AI Loading/i.test(coach.textContent);
  status.textContent = ready ? 'This browser model is already on or loading in the RCA Coach section.' : '';
  dialog.hidden = false;
}

async function startBrowserModel(dialog) {
  const status = dialog.querySelector('.h2c-browser-ai-status');
  status.textContent = 'Looking for the in-browser coach…';
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const coach = document.querySelector('section[aria-label="RCA coach"]');
    const enable = coach && [...coach.querySelectorAll('button')].find((b) => /Enable AI Assistant/.test(b.textContent));
    if (enable) {
      enable.click();
      coach.scrollIntoView({ behavior: 'smooth', block: 'center' });
      dialog.hidden = true;
      return;
    }
    if (coach && [...coach.querySelectorAll('button')].some((b) => /Unload|Disable AI/.test(b.textContent))) {
      coach.scrollIntoView({ behavior: 'smooth', block: 'center' });
      status.textContent = 'The browser model is already enabled. Progress stays in the RCA Coach section.';
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  status.textContent = 'The coach has not finished loading. Wait a moment and press the button again. Nothing else on the page was changed.';
}
