import { API_BASE } from "./config.js";

const find = (selector) => document.querySelector(selector);
const money = (value) => `PKR ${Number(value).toLocaleString("en-PK")}`;

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function request(path, options = {}) {
  const response = await fetch(API_BASE + path, options);
  if (!response.ok) throw new Error(response.status === 401 ? "Invalid seller token." : "Request failed. Try again.");
  return response.json();
}

function phoneCard(phone) {
  const card = element("article", "", "card");
  card.append(element("h3", phone.name), element("p", `${phone.storage} GB · ${phone.color}`),
    element("p", `${money(phone.price)} · ${phone.pta_approved ? "PTA approved" : "Non-PTA"}`),
    element("p", phone.stock ? `${phone.stock} in stock` : "Out of stock"));
  return card;
}

async function storefront() {
  const catalog = find("#catalog");
  const messages = find("#messages");
  const input = find("#message");
  const send = find("#chat button");
  const reset = find("#new-chat");
  const userId = localStorage.getItem("shopbot-user") || crypto.randomUUID();
  localStorage.setItem("shopbot-user", userId);
  let threadId = crypto.randomUUID();
  const addMessage = (label, content) => {
    messages.append(element("p", `${label}: ${content}`, "message"));
    messages.scrollTop = messages.scrollHeight;
  };
  reset.addEventListener("click", () => {
    threadId = crypto.randomUUID();
    messages.replaceChildren();
    addMessage("ShopBot", "New conversation. What are you looking for?");
  });
  find("#chat").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || send.disabled) return;
    send.disabled = reset.disabled = true;
    addMessage("You", message);
    input.value = "";
    try {
      const result = await request("/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, thread_id: threadId, message }),
      });
      addMessage("ShopBot", result.reply);
      if (result.tool_calls.some((call) => call.name === "reserve_phone" && call.success)) await loadCatalog();
    } catch (error) {
      addMessage("ShopBot", error.message);
    } finally {
      send.disabled = reset.disabled = false;
      input.focus();
    }
  });
  addMessage("ShopBot", "Tell me your budget, storage needs, and whether you need PTA approval.");
  let phones = [];
  function render() {
    const query = find("#filter").value.trim().toLowerCase();
    const matches = phones.filter((phone) => `${phone.name} ${phone.storage} GB ${phone.color}`.toLowerCase().includes(query));
    catalog.replaceChildren(...(matches.length ? matches.map(phoneCard) : [element("p", "No matching phones.")]));
  }
  async function loadCatalog() {
    try {
      phones = await request("/catalog");
      render();
    } catch (error) {
      catalog.textContent = error.message;
    }
  }
  find("#filter").addEventListener("input", render);
  await loadCatalog();
}

function seller() {
  const status = find("#seller-status");
  const dashboard = find("#dashboard");
  async function refresh(token) {
    const headers = { Authorization: `Bearer ${token}` };
    const data = await request("/seller/dashboard", { headers });
    find("#inventory").replaceChildren(...data.inventory.map((phone) => {
      const card = phoneCard(phone);
      const form = element("form", "");
      const label = element("label", "Available units ");
      const stock = document.createElement("input");
      Object.assign(stock, { type: "number", min: "0", max: "10000", required: true, value: phone.stock });
      label.append(stock);
      const save = element("button", "Save stock");
      form.append(label, save);
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        save.disabled = true;
        try {
          await request(`/seller/inventory/${encodeURIComponent(phone.id)}`, {
            method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ stock: stock.valueAsNumber }),
          });
          await refresh(token);
          status.textContent = "Stock saved.";
        } catch (error) {
          status.textContent = error.message;
        } finally {
          save.disabled = false;
        }
      });
      card.append(form);
      return card;
    }));
    find("#reservations").replaceChildren(...(data.reservations.length
      ? data.reservations.map((hold) => {
        const card = element("article", "", "card");
        card.append(element("h3", hold.code), element("p", `${hold.name} · ${hold.storage} GB · ${hold.color}`),
          element("p", money(hold.price)), element("p", new Date(hold.created_at).toLocaleString()));
        return card;
      }) : [element("p", "No pickup holds yet.")]));
    dashboard.hidden = false;
  }
  find("#seller-login").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = find("#seller-token");
    const token = input.value;
    input.value = "";
    dashboard.hidden = true;
    status.textContent = "Loading dashboard…";
    try {
      await refresh(token);
      status.textContent = "Dashboard loaded.";
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

if (find("#catalog")) storefront();
if (find("#seller-login")) seller();
