/** Один ключ для Header и раннего скрипта в `layout` — иначе на телефоне первый кадр без тёмной темы. */
export const SITE_THEME_STORAGE_KEY = "site-theme";

/**
 * Выполняется до гидрации: выставляет `class="dark"` на `<html>` из localStorage / prefers-color-scheme.
 * Должна совпадать с логикой в `header.tsx`.
 */
export const SITE_THEME_BOOTSTRAP_SCRIPT = `!function(){try{var k=${JSON.stringify(
  SITE_THEME_STORAGE_KEY,
)};var s=localStorage.getItem(k);var p=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=s?s==="dark":p;document.documentElement.classList.toggle("dark",d);}catch(e){}}();`;
