// PrintPalette API client — port of the original js/api.js
// Preserves localStorage keys (pp_token, pp_user, pp_cart, pp_api_base, pp_theme)
// and endpoint shapes so the existing backend at loja-print-palette.onrender.com keeps working.

const DEFAULT_REMOTE = "https://loja-print-palette.onrender.com";
let resolvedBasePromise: Promise<string> | null = null;

const cleanBase = (url?: string | null) => String(url || "").trim().replace(/\/+$/, "");
const isLocalHost = (host: string) => host === "127.0.0.1" || host === "localhost";
const isStaticHost = (host: string) =>
  host.endsWith("github.io") || host.endsWith("pages.dev") || host.endsWith("netlify.app") || host.endsWith("lovable.app") || host.endsWith("lovableproject.com");

function getStoredBase(): string {
  if (typeof window === "undefined") return "";
  const override = (typeof (window as any).API_BASE_URL === "string" && (window as any).API_BASE_URL)
    ? cleanBase((window as any).API_BASE_URL)
    : "";

  let saved = override || cleanBase(localStorage.getItem("pp_api_base")) || cleanBase(sessionStorage.getItem("pp_api_base"));
  if (!saved) return "";

  const host = location.hostname;
  if (saved.includes("github.io") && !host.endsWith("github.io")) {
    localStorage.removeItem("pp_api_base");
    sessionStorage.removeItem("pp_api_base");
    return "";
  }
  return saved;
}

function getCandidateBases(): string[] {
  if (typeof window === "undefined") return [DEFAULT_REMOTE];
  const host = location.hostname;
  const ownOrigin = cleanBase(location.origin);
  const saved = getStoredBase();
  const bases: string[] = [];

  if (saved) bases.push(saved);

  if ((location.protocol === "http:" || location.protocol === "https:") && !isLocalHost(host) && !isStaticHost(host)) {
    bases.push(ownOrigin);
  }

  if (!bases.includes(DEFAULT_REMOTE)) bases.push(DEFAULT_REMOTE);
  return [...new Set(bases.filter(Boolean))];
}

async function probeBase(base: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}/health`, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resolveBase(): Promise<string> {
  if (resolvedBasePromise) return resolvedBasePromise;
  resolvedBasePromise = (async () => {
    const candidates = getCandidateBases();
    for (const base of candidates) {
      if (await probeBase(base)) {
        try {
          localStorage.setItem("pp_api_base", base);
          sessionStorage.setItem("pp_api_base", base);
        } catch {}
        return base;
      }
    }
    return candidates[0] || DEFAULT_REMOTE;
  })();
  return resolvedBasePromise;
}

// ---------- token / user storage ----------
export function getToken(): string {
  return (
    localStorage.getItem("pp_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("pp_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}
export function setToken(token: string) {
  if (!token) return;
  localStorage.setItem("pp_token", token);
  localStorage.setItem("token", token);
  sessionStorage.setItem("pp_token", token);
  sessionStorage.setItem("token", token);
  window.dispatchEvent(new Event("pp:authChanged"));
}
export function removeToken() {
  ["pp_token", "token"].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  window.dispatchEvent(new Event("pp:authChanged"));
}

export interface AppUser {
  id?: string;
  _id?: string;
  nome?: string;
  email?: string;
  telefone?: string;
  role?: "cliente" | "admin" | "entregador" | string;
  isSubscribed?: boolean;
  subscriptionPlan?: string;
  subscriptionEndsAt?: string | null;
}

export function getUser(): AppUser | null {
  const raw =
    localStorage.getItem("pp_user") ||
    localStorage.getItem("user") ||
    sessionStorage.getItem("pp_user") ||
    sessionStorage.getItem("user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function setUser(user: AppUser) {
  if (!user) return;
  const raw = JSON.stringify(user);
  ["pp_user", "user"].forEach((k) => {
    localStorage.setItem(k, raw);
    sessionStorage.setItem(k, raw);
  });
  window.dispatchEvent(new Event("pp:authChanged"));
}
export function removeUser() {
  ["pp_user", "user"].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  window.dispatchEvent(new Event("pp:authChanged"));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ---------- cart ----------
export interface CartItem {
  _id: string;
  nome: string;
  preco: number;
  imagem_url?: string;
  quantidade: number;
}

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("pp_cart") || sessionStorage.getItem("pp_cart") || "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
export function saveCart(cart: CartItem[]) {
  const raw = JSON.stringify(Array.isArray(cart) ? cart : []);
  localStorage.setItem("pp_cart", raw);
  sessionStorage.setItem("pp_cart", raw);
  window.dispatchEvent(new Event("pp:cartUpdated"));
}
export function cartCount(): number {
  return getCart().reduce((s, i) => s + (Number(i.quantidade) || 0), 0);
}
export function cartTotal(): number {
  return getCart().reduce((s, i) => s + (Number(i.preco) || 0) * (Number(i.quantidade) || 0), 0);
}
export function addToCart(product: any, quantidade = 1): CartItem[] {
  if (!product || !product._id) throw new Error("Produto inválido");
  const cart = getCart();
  const idx = cart.findIndex((i) => i._id === product._id);
  if (idx >= 0) {
    cart[idx].quantidade = (Number(cart[idx].quantidade) || 0) + (Number(quantidade) || 1);
  } else {
    cart.push({
      _id: product._id,
      nome: product.nome,
      preco: Number(product.preco_desconto || product.preco || 0),
      imagem_url: product.imagem_url || "",
      quantidade: Number(quantidade) || 1,
    });
  }
  saveCart(cart);
  return cart;
}
export function updateCartItem(productId: string, quantidade: number): CartItem[] {
  const cart = getCart()
    .map((i) => (i._id === productId ? { ...i, quantidade: Number(quantidade) || 1 } : i))
    .filter((i) => i.quantidade > 0);
  saveCart(cart);
  return cart;
}
export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((i) => i._id !== productId);
  saveCart(cart);
  return cart;
}
export function clearCart() { saveCart([]); }

// ---------- request helper ----------
function isAbsoluteAssetUrl(value: string) {
  return /^(?:https?:)?\/\//i.test(String(value || "").trim())
    || String(value || "").trim().startsWith("data:")
    || String(value || "").trim().startsWith("blob:");
}
function absolutizeAssetUrl(value: string | undefined, base: string) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (isAbsoluteAssetUrl(clean)) return clean;
  const normalizedBase = cleanBase(base || (typeof location !== "undefined" ? location.origin : DEFAULT_REMOTE));
  return `${normalizedBase}/${clean.replace(/^\/+/, "")}`;
}

export interface Product {
  _id: string;
  nome: string;
  descricao?: string;
  preco: number;
  preco_desconto?: number;
  imagem_url?: string;
  social_image_url?: string;
  social_video_url?: string;
  categoria?: string;
  tipo?: string;
  visivel?: boolean;
  destaque?: boolean;
  estoque?: number;
}

function normalizeProduct(p: any, base: string): Product {
  if (!p || typeof p !== "object") return p;
  return {
    ...p,
    imagem_url: absolutizeAssetUrl(p.imagem_url, base),
    social_image_url: absolutizeAssetUrl(p.social_image_url, base),
    social_video_url: absolutizeAssetUrl(p.social_video_url, base),
  };
}

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  let base = await resolveBase();
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.body && !options.isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const doFetch = (targetBase: string) =>
    fetch(`${targetBase}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.isFormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    });

  let response: Response;
  try {
    response = await doFetch(base);
  } catch (networkErr) {
    if (base !== DEFAULT_REMOTE) {
      localStorage.setItem("pp_api_base", DEFAULT_REMOTE);
      sessionStorage.setItem("pp_api_base", DEFAULT_REMOTE);
      resolvedBasePromise = Promise.resolve(DEFAULT_REMOTE);
      response = await doFetch(DEFAULT_REMOTE);
      base = DEFAULT_REMOTE;
    } else {
      throw networkErr;
    }
  }

  if ((response.status === 404 || response.status === 405) && base !== DEFAULT_REMOTE) {
    const fallback = await doFetch(DEFAULT_REMOTE).catch(() => null);
    if (fallback && fallback.ok) {
      localStorage.setItem("pp_api_base", DEFAULT_REMOTE);
      sessionStorage.setItem("pp_api_base", DEFAULT_REMOTE);
      resolvedBasePromise = Promise.resolve(DEFAULT_REMOTE);
      response = fallback;
    }
  }

  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text || null; }

  if (!response.ok) {
    const err: any = new Error((data && (data.error || data.message)) || `Erro ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

// ---------- API surface ----------
export async function login(email: string, password: string) {
  const data: any = await request("/api/auth/login", {
    method: "POST",
    body: { email: String(email || "").trim().toLowerCase(), password },
  });
  if (data?.token) setToken(data.token);
  if (data?.user) setUser(data.user);
  return data;
}

export async function register(payload: { nome: string; email: string; password: string; telefone?: string }) {
  const normalized = { ...payload, email: String(payload?.email || "").trim().toLowerCase() };
  const data: any = await request("/api/auth/register", { method: "POST", body: normalized });
  if (data?.token) setToken(data.token);
  if (data?.user) setUser(data.user);
  return data;
}

export function logout(redirectPath?: string) {
  removeToken();
  removeUser();
  if (typeof window !== "undefined" && redirectPath) {
    window.location.href = redirectPath;
  }
}

export async function getProfile() {
  const data: any = await request("/api/users/me");
  if (data) {
    setUser({
      ...(getUser() || {}),
      id: data._id || data.id,
      nome: data.nome,
      role: data.role,
      telefone: data.telefone,
      email: data.email,
      isSubscribed: !!data.isSubscribed,
      subscriptionPlan: data.subscriptionPlan || "",
      subscriptionEndsAt: data.subscriptionEndsAt || null,
    });
  }
  return data;
}

export async function updateProfile(payload: Partial<AppUser>) {
  const data: any = await request("/api/users/me", { method: "PUT", body: payload });
  if (data) {
    setUser({
      ...(getUser() || {}),
      id: data._id || data.id,
      nome: data.nome,
      role: data.role,
      telefone: data.telefone,
      email: data.email,
      isSubscribed: !!data.isSubscribed,
      subscriptionPlan: data.subscriptionPlan || "",
      subscriptionEndsAt: data.subscriptionEndsAt || null,
    });
  }
  return data;
}

// products
export async function getProducts(includeAll = false): Promise<Product[]> {
  const data = await request<any[]>(includeAll ? "/api/products/all" : "/api/products");
  const base = await resolveBase();
  return Array.isArray(data) ? data.map((p) => normalizeProduct(p, base)) : [];
}
export async function getProductById(id: string): Promise<Product> {
  if (!id) throw new Error("Produto não encontrado");
  const data = await request<any>(`/api/products/${id}`);
  const base = await resolveBase();
  return normalizeProduct(data, base);
}
export async function createProduct(payload: Partial<Product>) {
  const data = await request<any>("/api/products", { method: "POST", body: payload });
  const base = await resolveBase();
  return normalizeProduct(data, base);
}
export async function updateProduct(id: string, payload: Partial<Product>) {
  const data = await request<any>(`/api/products/${id}`, { method: "PUT", body: payload });
  const base = await resolveBase();
  return normalizeProduct(data, base);
}
export async function deleteProduct(id: string) {
  return request(`/api/products/${id}`, { method: "DELETE" });
}
export async function reorderProducts(items: Array<{ _id: string; ordem: number }>) {
  const data = await request<any[]>("/api/products/reorder", { method: "PATCH", body: { items } });
  const base = await resolveBase();
  return Array.isArray(data) ? data.map((p) => normalizeProduct(p, base)) : [];
}

// orders
export interface OrderItem {
  produtoId: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}
export interface OrderPayload {
  cliente: { nome: string; contacto: string; morada: string; linkMapa?: string | null };
  items: OrderItem[];
  subtotalProducts: number;
  deliveryFee: number;
  deliveryDistanceKm: number | null;
  total: number;
  pagamento: string;
  fulfillmentMethod: "pickup" | "delivery";
  pickupLocation: string;
  notas?: string;
}

export async function getOrders() { return request<any[]>("/api/orders"); }
export async function getOrderById(id: string) {
  if (!id) throw new Error("Pedido não encontrado");
  return request<any>(`/api/orders/${id}`);
}
export async function trackOrder(id: string) {
  return request<any>(`/api/orders/track/${id}`);
}
export async function createOrder(payload: OrderPayload) {
  return request<{ orderId: string; order?: any }>("/api/orders", { method: "POST", body: payload });
}
export async function createCustomOrder(formData: FormData) {
  return request<any>("/api/orders/custom", { method: "POST", body: formData, isFormData: true });
}
export async function updateOrder(id: string, payload: any) {
  return request<any>(`/api/orders/${id}`, { method: "PUT", body: payload });
}
export async function deleteOrder(id: string) {
  return request(`/api/orders/${id}`, { method: "DELETE" });
}

// deliverers / admin clients (kept for phase 2)
export async function getDeliverers() { return request<any[]>("/api/deliverers"); }
export async function getMyDeliveries() { return request<any[]>("/api/deliverers/me/orders"); }
export async function updateDeliveryStatus(orderId: string, status: string) {
  return request(`/api/deliverers/orders/${orderId}/status`, { method: "PUT", body: { status } });
}
export async function getClients(params: Record<string, any> = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "") as any).toString();
  return request<any[]>(`/api/admin/clients${qs ? `?${qs}` : ""}`);
}

// media
export async function getMediaLibrary(params: Record<string, any> = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "") as any).toString();
  return request<any[]>(`/api/media/library${qs ? `?${qs}` : ""}`);
}
export async function uploadMedia(formData: FormData) {
  return request<any>("/api/media/upload", { method: "POST", body: formData, isFormData: true });
}

// kick-off base resolution early
if (typeof window !== "undefined") {
  resolveBase().catch(() => {});
  // expose on window for backwards-compat with any external scripts that read window.api
  (window as any).api = {
    request, getToken, setToken, removeToken, getUser, setUser, removeUser,
    isLoggedIn, getCart, saveCart, cartCount, cartTotal, addToCart, updateCartItem,
    removeFromCart, clearCart: () => clearCart(), login, register, logout,
    getProfile, updateProfile, getProducts, getProductById, getProduct: getProductById,
    createProduct, updateProduct, deleteProduct, reorderProducts,
    getOrders, getOrderById, trackOrder, createOrder, createCustomOrder, updateOrder, deleteOrder,
    getDeliverers, getMyDeliveries, updateDeliveryStatus, getClients,
    getMediaLibrary, uploadMedia, currentUser: getUser,
    base: resolveBase,
  };
}
