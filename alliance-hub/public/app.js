const homeView = document.querySelector("#home-view");
const aboutView = document.querySelector("#about-view");
const intakeView = document.querySelector("#intake-view");
const profileView = document.querySelector("#profile-view");
const invalidLinkView = document.querySelector("#invalid-link-view");
const phoneStartForm = document.querySelector("#phone-start-form");
const startSubmit = document.querySelector("#start_submit");
const startAlert = document.querySelector("#start-alert");
const homeExpiredAlert = document.querySelector("#home-expired-alert");
const form = document.querySelector("#profile-form");
const alertBox = document.querySelector("#alert");
const profileAlert = document.querySelector("#profile-alert");
const submit = document.querySelector("#submit");
const phone = document.querySelector("#phone");
const distinction = document.querySelector("#distinction");
const imageFile = document.querySelector("#image_file");
const imageUrl = document.querySelector("#image_url");
const imagePreview = document.querySelector("#image_preview");
const imageInitials = document.querySelector("#image_initials");
const profileCard = document.querySelector("#profile-card");
const editProfile = document.querySelector("#edit-profile");
const memoryKey = "alliance.smsProfile.v1";

const route = readRoute();
const token = route.token;
let activeProfileId = route.profileId;

boot();

async function boot() {
  hydrateRememberedProfileLinks();

  if (route.about) {
    showAbout();
    return;
  }

  if (route.home) {
    showHome();
    return;
  }

  if (route.profileId) {
    await bootProfile(route.profileId);
    return;
  }

  if (!token) {
    showHome();
    return;
  }

  try {
    const response = await fetch(`/api/profile-intake/session/${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" },
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "profile_session_failed");
    phone.value = result.phone_display || "Attached to SMS";
    fillDistinctions(result.distinctions || [], result.profile?.distinction || "");
    if (result.mode === "edit" && result.profile) fillProfileForm(result.profile);
    submit.textContent = result.mode === "edit" ? "Save Profile" : "Create Profile";
  } catch (error) {
    showExpiredHome();
  }
}

async function bootProfile(profileId) {
  homeView.hidden = true;
  intakeView.hidden = true;
  aboutView.hidden = true;
  profileView.hidden = false;
  activeProfileId = profileId;

  try {
    const response = await fetch(`/api/profile-intake/profile/${encodeURIComponent(profileId)}`, {
      headers: { Accept: "application/json" },
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "profile_load_failed");
    rememberProfile(profileId, result.profile);
    renderProfile(result.profile);
  } catch (error) {
    profileCard.textContent = "This profile could not be loaded.";
    editProfile.hidden = true;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAlert(alertBox);
  if (!form.reportValidity()) return;

  submit.disabled = true;
  submit.textContent = submit.textContent.startsWith("Save") ? "Saving..." : "Creating...";

  const payload = {
    token,
    first_name: value("first_name"),
    last_name: value("last_name"),
    email: value("email"),
    image_url: value("image_url"),
    distinction: value("distinction"),
    sms_authorized: document.querySelector("#sms_authorized").checked,
  };

  try {
    const response = await fetch("/api/profile-intake/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) throw new Error(readSubmitError(result));
    activeProfileId = result.profile_id;
    rememberProfile(result.profile_id, {
      first_name: value("first_name"),
      last_name: value("last_name"),
      distinction: value("distinction"),
    });
    hydrateRememberedProfileLinks();
    form.hidden = true;
    show(alertBox, result.warning
      ? `Profile saved. Your profile link is ${location.origin}${result.profile_url}. Some SMS follow-up may finish later.`
      : `Profile saved. Your profile link is ${location.origin}${result.profile_url}.`);
    showProfileActions(result.profile_id);
  } catch (error) {
    fail(error.message || "We could not save the profile yet. Please try again.");
  } finally {
    submit.disabled = false;
    submit.textContent = submit.textContent.startsWith("Saving") ? "Save Profile" : "Create Profile";
  }
});

phoneStartForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAlert(startAlert);
  if (!phoneStartForm.reportValidity()) return;

  startSubmit.disabled = true;
  startSubmit.textContent = "Sending...";
  try {
    const response = await fetch("/api/profile-intake/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ phone: document.querySelector("#start_phone").value }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "profile_link_failed");
    show(startAlert, `Secure profile link sent by SMS to ${result.phone_display}.`);
    phoneStartForm.reset();
  } catch {
    startAlert.hidden = false;
    startAlert.classList.add("error");
    startAlert.textContent = "We could not send the profile link yet. Please check the number and try again.";
  } finally {
    startSubmit.disabled = false;
    startSubmit.textContent = "Send Profile Link";
  }
});

editProfile.addEventListener("click", requestEditLink);

imageUrl.addEventListener("input", () => setPreview(imageUrl.value));
imageFile.addEventListener("change", async () => {
  const file = imageFile.files?.[0];
  if (!file) return;
  try {
    const dataUrl = await imageToDataUrl(file);
    imageUrl.value = dataUrl;
    setPreview(dataUrl);
  } catch {
    fail("That image could not be prepared. Please choose a smaller image or paste an image URL.");
  }
});

function readRoute() {
  const parts = location.pathname.split("/").filter(Boolean);
  if ((parts[0] === "profile" || parts[0] === "a") && parts[1]) return { token: parts[1], profileId: "" };
  if (parts[0] === "member" && parts[1]) return { token: "", profileId: parts[1] };
  if (parts[0] === "about") return { token: "", profileId: "", about: true };
  if (parts.length === 0) return { token: "", profileId: "", home: true, linkExpired: new URLSearchParams(location.search).get("link") === "expired" };
  return { token: new URLSearchParams(location.search).get("token") || "", profileId: "", about: false };
}

function fillDistinctions(items, selected) {
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select distinction";
  distinction.replaceChildren(placeholder, ...items.map((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    option.selected = item === selected;
    return option;
  }));
}

function fillProfileForm(profile) {
  document.querySelector("#first_name").value = profile.first_name || "";
  document.querySelector("#last_name").value = profile.last_name || "";
  document.querySelector("#email").value = profile.email || "";
  imageUrl.value = profile.image_url || "";
  document.querySelector("#sms_authorized").checked = true;
  setPreview(profile.image_url || "");
}

function renderProfile(profile) {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  profileCard.replaceChildren();
  if (profile.image_url) {
    const img = document.createElement("img");
    img.src = profile.image_url;
    img.alt = name;
    profileCard.append(img);
  }
  const title = document.createElement("h2");
  title.textContent = name || "Alliance member";
  const meta = document.createElement("p");
  meta.textContent = profile.distinction || "";
  profileCard.append(title, meta);
}

function showProfileActions(profileId) {
  const link = document.createElement("a");
  link.href = `/member/${encodeURIComponent(profileId)}`;
  link.textContent = "Open profile";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Edit Profile";
  button.addEventListener("click", requestEditLink);
  alertBox.append(document.createElement("br"), link, document.createTextNode(" "), button);
}

function showInvalidLink() {
  homeView.hidden = true;
  aboutView.hidden = true;
  intakeView.hidden = true;
  profileView.hidden = true;
  invalidLinkView.hidden = false;
}

function showExpiredHome() {
  history.replaceState(null, "", "/?link=expired");
  route.home = true;
  route.linkExpired = true;
  showHome();
}

function showHome() {
  homeView.hidden = false;
  aboutView.hidden = true;
  intakeView.hidden = true;
  profileView.hidden = true;
  invalidLinkView.hidden = true;
  homeExpiredAlert.hidden = !route.linkExpired;
  hydrateRememberedProfileLinks();
}

function showAbout() {
  homeView.hidden = true;
  aboutView.hidden = false;
  intakeView.hidden = true;
  profileView.hidden = true;
  invalidLinkView.hidden = true;
  hydrateRememberedProfileLinks();
}

function rememberProfile(profileId, profile = {}) {
  if (!profileId) return;
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  localStorage.setItem(memoryKey, JSON.stringify({
    profile_id: profileId,
    display_name: displayName || "My profile",
    distinction: profile.distinction || "",
    remembered_at: new Date().toISOString(),
  }));
}

function rememberedProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(memoryKey) || "null");
    return parsed?.profile_id ? parsed : null;
  } catch {
    return null;
  }
}

function hydrateRememberedProfileLinks() {
  const remembered = rememberedProfile();
  const href = remembered ? `/member/${encodeURIComponent(remembered.profile_id)}` : "/profile";
  const label = remembered ? "My profile" : "Profile";
  for (const id of ["home-profile-link", "about-profile-link", "profile-nav-link", "invalid-profile-link", "intake-profile-link"]) {
    const link = document.querySelector(`#${id}`);
    if (!link) continue;
    link.href = href;
    link.textContent = label;
  }
  const action = document.querySelector("#about-primary-action");
  if (action) {
    action.href = href;
    action.textContent = remembered ? `Open ${remembered.display_name || "my profile"}` : "Open your SMS profile link";
  }
}

async function requestEditLink() {
  const targetAlert = profileView.hidden ? alertBox : profileAlert;
  clearAlert(targetAlert);
  const target = activeProfileId;
  if (!target) return;
  editProfile.disabled = true;
  try {
    const response = await fetch("/api/profile-intake/edit-link", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token, profile_id: target }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "edit_link_failed");
    show(targetAlert, `Secure edit link sent by SMS to ${result.phone_display}.`);
  } catch {
    fail("We could not send an edit link yet. Please try again.");
  } finally {
    editProfile.disabled = false;
  }
}

async function imageToDataUrl(file) {
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) throw new Error("invalid_image");
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const max = 720;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src) {
  return new Promise((resolveImage, reject) => {
    const img = new Image();
    img.onload = () => resolveImage(img);
    img.onerror = reject;
    img.src = src;
  });
}

function setPreview(src) {
  const usable = /^https?:\/\//i.test(src) || /^data:image\//i.test(src);
  imagePreview.hidden = !usable;
  imageInitials.hidden = usable;
  if (usable) imagePreview.src = src;
}

function value(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function readSubmitError(result) {
  const error = result?.error || result?.profile?.error || result?.sms_context?.error || "profile_submit_failed";
  const messages = {
    missing_required_profile_fields: "Please complete first name, last name, and distinction.",
    sms_authorization_required: "Please authorize Alliance Hub SMS messages before saving.",
    invalid_email: "Please enter a valid email address or leave email blank.",
    invalid_distinction: "Please choose a valid distinction.",
    invalid_image_url: "Use a valid image URL, or choose a PNG, JPG, or WebP image.",
    image_too_large: "That image is too large. Please choose a smaller image or remove the image before saving.",
    profile_token_expired: "This profile link has expired. Request a new profile link from the home page.",
    profile_token_used: "This profile link has already been used. Open your profile and request an edit link.",
    profile_token_replaced: "This profile link was replaced. Request a fresh profile link from the home page.",
    profile_context_not_found: "This profile link is no longer attached to an active SMS setup. Request a fresh profile link.",
    profile_form_secret_not_configured: "Profile setup is not configured yet. Please try again later.",
    supabase_not_configured: "Profile storage is not configured yet. Please try again later.",
    alliance_record_write_failed: "Profile storage did not accept the save yet. Please try again later.",
    profile_record_failed: "Profile storage did not accept the save yet. Please try again later.",
  };
  return messages[error] || `We could not save the profile yet: ${error}.`;
}

function show(target, message) {
  target.hidden = false;
  target.classList.remove("error");
  target.textContent = message;
}

function fail(message) {
  alertBox.hidden = false;
  alertBox.classList.add("error");
  alertBox.textContent = message;
}

function clearAlert(target) {
  if (!target) return;
  target.hidden = true;
  target.classList.remove("error");
  target.textContent = "";
}
