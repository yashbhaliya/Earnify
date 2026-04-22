// Blog Admin App — earnify-admin
const SUPABASE_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQyMDIxMCwiZXhwIjoyMDg3OTk2MjEwfQ.mr4k_GsJ14CC1mqvEZgf9cTaNiLMlnj_sZxFjJud67k';

// anon client — for reading/writing blog table
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// service-role client — for storage uploads only (bypasses RLS)
const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

let editingId = null;
const _blogMap = {};
const _mainArticleMap = {};
let _allBlogs = [];
let _blogPage = 1;
let _blogPageSize = 10;

function changeBlogPageSize() {
  const val = (typeof _cdValues !== 'undefined' ? _cdValues['blogPageSize'] : null)
    || document.getElementById('blogPageSize')?.value;
  _blogPageSize = val === 'all' ? 'all' : parseInt(val) || 10;
  _blogPage = 1;
  _renderBlogGrid();
}

function goToBlogPage(page) {
  const total = _allBlogs.length;
  const pageSize = _blogPageSize === 'all' ? total : _blogPageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  _blogPage = Math.max(1, Math.min(page, totalPages));
  _renderBlogGrid();
}

function _renderBlogGrid() {
  const grid = document.getElementById('blogGrid');
  const blogs = _allBlogs;
  const total = blogs.length;

  const pageSize = _blogPageSize === 'all' ? total : _blogPageSize;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
  _blogPage = Math.min(_blogPage, totalPages || 1);
  const start = (_blogPage - 1) * pageSize;
  const slice = _blogPageSize === 'all' ? blogs : blogs.slice(start, start + pageSize);

  if (!slice.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div><h3>No Blog Posts Yet</h3><p>Click "Add Blog Post" to create your first post!</p></div>`;
    _renderBlogPagination(0, 0, 0, 0);
    return;
  }

  grid.innerHTML = slice.map(b => {
    const slug = b.slug || generateSlug(b.title);
    const permalink = `/Blog/post/?permalink=${slug}`;
    return `
    <div class="blog-card" id="card-${b.id}">
      <div class="blog-card-img">
        ${b.image_url ? `<img src="${b.image_url}" alt="" onerror="this.style.display='none'">` : ''}
      </div>
      <div class="blog-card-body">
        <div class="blog-card-title">${b.title}</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="blog-category">${b.category || 'General'}</span>
          <span class="blog-status-badge ${b.is_published === true ? 'status-published' : 'status-unpublished'}">${b.is_published === true ? '🟢 Published' : '🔴 Unpublished'}</span>
        </div>
        <div class="blog-card-actions">
          <button class="btn-view-blog" onclick="window.open('${permalink}','_blank')">View</button>
          <button class="btn-edit-blog" onclick="openEditModal(_blogMap[${b.id}])">Edit</button>
          ${b.is_published === true
            ? `<button class="btn-unpublish-blog" onclick="togglePublish(${b.id}, false)">Unpublish</button>`
            : `<button class="btn-publish-blog" onclick="togglePublish(${b.id}, true)">Publish</button>`
          }
          <button class="btn-delete-blog" onclick="deleteBlog(${b.id})">Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');

  _renderBlogPagination(total, pageSize, totalPages, start);
}

function _renderBlogPagination(total, pageSize, totalPages, start) {
  let el = document.getElementById('blogPagination');
  if (!el) {
    el = document.createElement('div');
    el.id = 'blogPagination';
    document.querySelector('.blog-section').appendChild(el);
  }
  if (_blogPageSize === 'all' || totalPages <= 1) { el.innerHTML = ''; return; }

  const btnBase   = 'padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:1.5px solid #e2e8f0;background:#f8fafc;color:#64748b;transition:all .2s;';
  const btnActive = 'padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;';
  const range = 2;
  let pages = '';
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= _blogPage - range && p <= _blogPage + range)) {
      pages += `<button onclick="goToBlogPage(${p})" style="${p === _blogPage ? btnActive : btnBase}">${p}</button>`;
    } else if (p === _blogPage - range - 1 || p === _blogPage + range + 1) {
      pages += `<span style="padding:0 2px;color:#94a3b8;">…</span>`;
    }
  }
  el.innerHTML = `<div>
    <span style="font-size:12px;color:#94a3b8;font-weight:500;">Showing ${start + 1}–${Math.min(start + pageSize, total)} of ${total}</span>
    <div>
      <button onclick="goToBlogPage(${_blogPage - 1})" ${_blogPage === 1 ? 'disabled' : ''} style="${btnBase}opacity:${_blogPage === 1 ? '.4' : '1'};">&#8249; Prev</button>
      ${pages}
      <button onclick="goToBlogPage(${_blogPage + 1})" ${_blogPage === totalPages ? 'disabled' : ''} style="${btnBase}opacity:${_blogPage === totalPages ? '.4' : '1'};">Next &#8250;</button>
    </div>
  </div>`;
}

// ── RICH TEXT EDITOR HELPERS ──
function rte(cmd) {
  document.getElementById('blogContent').focus();
  document.execCommand(cmd, false, null);
}

function rteBlock(tag) {
  document.getElementById('blogContent').focus();
  document.execCommand('formatBlock', false, tag);
}

let _savedRange = null;

function rteLink() {
  const editor = document.getElementById('blogContent');
  editor.focus();
  const sel = window.getSelection();
  _savedRange = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
  const selectedText = _savedRange ? _savedRange.toString() : '';
  document.getElementById('linkText').value = selectedText;
  document.getElementById('linkUrl').value = '';
  document.getElementById('linkNewTab').checked = true;
  document.getElementById('linkPreview').style.display = 'none';
  document.getElementById('linkModal').classList.add('open');
  setTimeout(() => document.getElementById('linkUrl').focus(), 80);
}

function updateLinkPreview() {
  const url  = document.getElementById('linkUrl').value.trim();
  const text = document.getElementById('linkText').value.trim();
  const preview = document.getElementById('linkPreview');
  const anchor  = document.getElementById('linkPreviewAnchor');
  if (url) {
    anchor.href        = url;
    anchor.textContent = text || url;
    preview.style.display = 'flex';
  } else {
    preview.style.display = 'none';
  }
}

function openLinkPreview() {
  const url = document.getElementById('linkUrl').value.trim();
  if (url) window.open(url, '_blank');
  return false;
}

function setLinkUrl(url) {
  document.getElementById('linkUrl').value = url;
  updateLinkPreview();
  // Focus at end so user can type the slug after /Blog/post/?permalink=
  const input = document.getElementById('linkUrl');
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function closeLinkModal() {
  document.getElementById('linkModal').classList.remove('open');
  _savedRange = null;
}

function insertLink() {
  const url     = document.getElementById('linkUrl').value.trim();
  const text    = document.getElementById('linkText').value.trim();
  const newTab  = document.getElementById('linkNewTab').checked;
  if (!url) { document.getElementById('linkUrl').focus(); return; }

  const editor = document.getElementById('blogContent');
  editor.focus();

  const sel = window.getSelection();
  if (_savedRange) {
    sel.removeAllRanges();
    sel.addRange(_savedRange);
  }

  if (text && _savedRange && _savedRange.toString() === '') {
    const a = document.createElement('a');
    a.href = url;
    a.textContent = text;
    if (newTab) { a.target = '_blank'; a.rel = 'noopener'; }
    _savedRange.insertNode(a);
    const range = document.createRange();
    range.setStartAfter(a);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    document.execCommand('createLink', false, url);
    const links = editor.querySelectorAll('a[href="' + url + '"]');
    links.forEach(a => {
      if (newTab) { a.target = '_blank'; a.rel = 'noopener'; }
    });
  }

  closeLinkModal();
}

function rteFontSize(sel) {
  if (!sel.value) return;
  document.getElementById('blogContent').focus();
  document.execCommand('fontSize', false, sel.value);
  sel.value = '';
}

function rteColor(color) {
  document.getElementById('blogContent').focus();
  document.execCommand('foreColor', false, color);
}

function rteClear() {
  const editor = document.getElementById('blogContent');
  editor.focus();
  const sel = window.getSelection();
  const hasSelection = sel && !sel.isCollapsed;

  if (hasSelection) {
    // ── Selection exists: clear only selected text formatting ──
    document.execCommand('removeFormat', false, null);
    document.execCommand('unlink', false, null);
  } else {
    // ── No selection: clear ALL formatting but keep text & structure intact ──
    // Walk every element inside editor and strip inline styles / tags
    // without touching text content or block structure
    const stripInline = (node) => {
      if (node.nodeType !== 1) return; // skip text nodes
      // Unwrap inline formatting tags but keep block tags and text
      const inlineTags = ['B','STRONG','I','EM','U','S','STRIKE','FONT','SPAN','A'];
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 1 && inlineTags.includes(child.tagName)) {
          // Replace tag with its children
          const frag = document.createDocumentFragment();
          while (child.firstChild) frag.appendChild(child.firstChild);
          node.replaceChild(frag, child);
        } else {
          stripInline(child);
        }
      });
      // Remove inline style attribute from block elements
      if (node.hasAttribute && node.hasAttribute('style')) node.removeAttribute('style');
      if (node.hasAttribute && node.hasAttribute('color')) node.removeAttribute('color');
    };
    stripInline(editor);
  }
}

// Get HTML content from editor
function getContent() {
  return document.getElementById('blogContent').innerHTML.trim();
}

// Set HTML content into editor
function setContent(html) {
  document.getElementById('blogContent').innerHTML = html || '';
}

// ── TOAST ──
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3200);
}

// ── CLOSE UPLOAD ERROR POPUP ──
function closeUploadError() {
  document.getElementById('uploadErrorPopup').classList.remove('show');
  document.getElementById('imgHint').style.display = '';
}

// ── COVER IMAGE PREVIEW (from URL input) ──
function previewCover(url) {
  const img   = document.getElementById('coverImgPreview');
  const cover = document.getElementById('editorCoverPreview');
  const urlInput = document.getElementById('blogImageUrl');

  if (url && url.trim()) {
    img.src = url.trim();
    img.onload  = () => cover.classList.add('has-image');
    img.onerror = () => {
      cover.classList.remove('has-image');
      img.src = '';
    };
  } else {
    img.src = '';
    cover.classList.remove('has-image');
  }
}

// ── HANDLE FILE PICKER SELECTION ──
async function handleCoverFile(input) {
  const file = input.files[0];
  if (!file) return;

  const img      = document.getElementById('coverImgPreview');
  const cover    = document.getElementById('editorCoverPreview');
  const urlInput = document.getElementById('blogImageUrl');

  // 1. Instant local preview
  img.src = URL.createObjectURL(file);
  cover.classList.add('has-image');

  // 2. Show uploading state
  urlInput.value    = 'Uploading...';
  urlInput.disabled = true;

  try {
    // 3. Upload to Supabase Storage
    const ext  = file.name.split('.').pop();
    const path = `covers/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabaseAdmin
      .storage
      .from('blog-images')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) throw uploadErr;

    // 4. Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('blog-images')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    // 5. Update input + preview with real URL
    urlInput.value    = publicUrl;
    urlInput.disabled = false;
    img.src           = publicUrl;
    cover.classList.add('has-image');

    // 6. Hide error popup if shown
    document.getElementById('uploadErrorPopup').classList.remove('show');
    document.getElementById('imgHint').style.display = '';

    window._coverFile = null;
    showToast('✅ Image uploaded!');

  } catch (err) {
    urlInput.value       = '';
    urlInput.disabled    = false;
    urlInput.placeholder = 'Paste URL manually';
    window._coverFile    = file;

    const errMsg = err?.message || err?.error_description || 'Storage bucket not found or not public.';
    document.getElementById('uploadErrorMsg').textContent = errMsg;
    document.getElementById('uploadErrorPopup').classList.add('show');
    document.getElementById('imgHint').style.display = 'none';
  }
}

// ── OPEN ADD EDITOR ──
function openAddModal() {
  editingId = null;
  window._coverFile = null;
  document.getElementById('modalTitle').textContent = '✍️ New Blog Post';
  document.getElementById('publishBtn').textContent = '🚀 Publish Post';
  document.getElementById('editorStatus').textContent = 'Draft';
  document.getElementById('editorStatus').className = 'editor-autosave';
  document.getElementById('statusBadge').textContent = '📝 Draft';
  document.getElementById('statusBadge').className = 'editor-status-badge';

  document.getElementById('blogTitle').value = '';
  document.getElementById('blogCategory').value = '';
  document.getElementById('blogExcerpt').value = '';
  setContent('');
  document.getElementById('blogImageUrl').value = '';
  document.getElementById('coverFileInput').value = '';
  document.getElementById('coverImgPreview').src = '';
  document.getElementById('editorCoverPreview').classList.remove('has-image');
  document.getElementById('uploadErrorPopup').classList.remove('show');
  document.getElementById('imgHint').style.display = '';
  document.getElementById('blogImageUrl').placeholder = 'https://example.com/image.jpg';
  document.getElementById('blogMainArticle').checked = false;

  document.getElementById('blogEditor').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('blogTitle').focus(), 300);
}

// ── OPEN EDIT EDITOR ──
function openEditModal(blog) {
  editingId = blog.id;
  window._coverFile = null;
  document.getElementById('modalTitle').textContent = '✏️ Edit Blog Post';
  document.getElementById('publishBtn').textContent = '💾 Update Post';
  document.getElementById('editorStatus').textContent = 'Editing';
  document.getElementById('editorStatus').className = 'editor-autosave';
  document.getElementById('statusBadge').textContent = '✅ Published';
  document.getElementById('statusBadge').className = 'editor-status-badge published';

  document.getElementById('blogTitle').value = blog.title || '';
  document.getElementById('blogCategory').value = blog.category || '';
  document.getElementById('blogExcerpt').value = blog.excerpt || '';
  setContent(blog.content || '');
  document.getElementById('blogImageUrl').value = blog.image_url || '';
  document.getElementById('coverFileInput').value = '';
  document.getElementById('uploadErrorPopup').classList.remove('show');
  document.getElementById('imgHint').style.display = '';
  document.getElementById('blogImageUrl').placeholder = 'https://example.com/image.jpg';
  document.getElementById('blogMainArticle').checked = blog.main_article ?? _mainArticleMap[blog.id] ?? false;
  // Set cover image
  const img   = document.getElementById('coverImgPreview');
  const cover = document.getElementById('editorCoverPreview');
  if (blog.image_url) {
    img.src = blog.image_url;
    img.onload  = () => cover.classList.add('has-image');
    img.onerror = () => { cover.classList.remove('has-image'); img.src = ''; };
  } else {
    img.src = '';
    cover.classList.remove('has-image');
  }

  document.getElementById('blogEditor').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── CLOSE EDITOR ──
function closeBlogModal() {
  document.getElementById('blogEditor').classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

// ── SUBMIT ──
async function submitBlogForm() {
  const title   = document.getElementById('blogTitle').value.trim();
  const content = getContent();

  if (!title)   { showToast('❌ Title is required', 'error'); document.getElementById('blogTitle').focus(); return; }
  if (!content || content === '<br>') { showToast('❌ Content is required', 'error'); document.getElementById('blogContent').focus(); return; }

  let authorEmail = 'admin', authorName = 'Admin';
  try {
    const token = localStorage.getItem('adminToken');
    if (token) {
      const p = JSON.parse(atob(token.split('.')[1]));
      authorEmail = p.email || authorEmail;
      authorName  = p.email?.split('@')[0] || authorName;
    } else {
      const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
      authorEmail = cu.email || authorEmail;
      authorName  = cu.user_metadata?.name || cu.email?.split('@')[0] || authorName;
    }
  } catch(e) {}

  const btn    = document.getElementById('publishBtn');
  const status = document.getElementById('editorStatus');
  btn.disabled = true;
  btn.textContent = '⏳ Saving...';
  status.textContent = 'Saving...';
  status.className = 'editor-autosave';

  // ── Resolve image URL ──
  let imageUrl = document.getElementById('blogImageUrl').value.trim() || null;

  // If a file was picked, upload it to Supabase Storage
  if (window._coverFile) {
    try {
      const file = window._coverFile;
      const ext  = file.name.split('.').pop();
      const path = `covers/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadErr } = await supabaseAdmin
        .storage
        .from('blog-images')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabaseAdmin
        .storage
        .from('blog-images')
        .getPublicUrl(path);

      imageUrl = urlData.publicUrl;
    } catch (uploadErr) {
      // Upload failed — use the local object URL as fallback (won't persist, but won't block save)
      console.warn('Image upload failed, using local preview:', uploadErr.message);
      imageUrl = document.getElementById('coverImgPreview').src || null;
    }
  }

  const payload = {
    title,
    slug:         editingId ? undefined : generateSlug(title),
    category:     document.getElementById('blogCategory').value.trim(),
    excerpt:      document.getElementById('blogExcerpt').value.trim(),
    content,
    image_url:    imageUrl,
    author_email: authorEmail,
    author_name:  authorName,
    main_article: document.getElementById('blogMainArticle').checked,
  };
  if (payload.slug === undefined) delete payload.slug;

  // New posts start as published
  if (!editingId) payload.is_published = true;

  // Save main_article state locally so it persists across edits
  const isMainArticle = document.getElementById('blogMainArticle').checked;
  if (editingId) _mainArticleMap[editingId] = isMainArticle;

  try {
    let error;
    if (editingId) {
      ({ error } = await supabaseClient.from('blogs').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabaseClient.from('blogs').insert([payload]));
    }
    if (error) throw error;

    status.textContent = 'Saved ✓';
    status.className = 'editor-autosave saved';
    showToast(editingId ? '✅ Post updated!' : '✅ Post published!');
    window._coverFile = null;
    setTimeout(() => { closeBlogModal(); loadBlogs(); }, 600);
  } catch (err) {
    const msg = err?.message || err?.error_description || JSON.stringify(err);
    showToast('❌ ' + msg, 'error');
    status.textContent = 'Error';
    btn.disabled = false;
    btn.textContent = editingId ? '💾 Update Post' : '🚀 Publish Post';
  }
}

// ── LOAD BLOGS ──
async function loadBlogs() {
  const grid = document.getElementById('blogGrid');
  // Check if this is initial load - keep showing skeleton for minimum time
  const hasSkeleton = grid.querySelector('.skeleton-post');
  const isInitialLoad = hasSkeleton && !grid.querySelector('.blog-card');
  if (isInitialLoad) {
    // Ensure skeleton is visible during load
    grid.style.minHeight = '300px';
  }
  try {
    const { data: blogs, error } = await supabaseClient
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!blogs || blogs.length === 0) {
      _allBlogs = [];
      document.getElementById('blogCount').textContent = '0 posts';
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✍️</div>
          <h3>No Blog Posts Yet</h3>
          <p>Click "Add Blog Post" to create your first post!</p>
        </div>`;
      const pag = document.getElementById('blogPagination');
      if (pag) pag.innerHTML = '';
      return;
    }

    blogs.forEach(b => { _blogMap[b.id] = b; });
    _allBlogs = blogs;

    const count = blogs.length;
    document.getElementById('blogCount').textContent = `${count} post${count !== 1 ? 's' : ''}`;
    _blogPage = 1;
    _renderBlogGrid();
  } catch (err) {
    const msg = err?.message || err?.error_description || JSON.stringify(err);
    console.error('Error loading blogs:', msg, err);
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to Load</h3>
        <p style="color:#ef4444;font-size:13px;max-width:400px;word-break:break-word;">${msg}</p>
        <p style="margin-top:8px;font-size:12px;color:#94a3b8;">Make sure the <strong>blogs</strong> table exists in your Supabase project.</p>
        <button onclick="loadBlogs()" style="margin-top:16px;padding:8px 20px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-family:inherit;">🔄 Retry</button>
      </div>`;
  }
}

// ── VIEW BLOG (rendered HTML) ──
function viewBlog(blog) {
  const img = document.getElementById('viewBlogImg');
  if (blog.image_url) {
    img.src = blog.image_url;
    img.classList.add('show');
  } else {
    img.src = '';
    img.classList.remove('show');
  }
  document.getElementById('viewBlogTitle').textContent   = blog.title || '';
  document.getElementById('viewBlogCategory').textContent = blog.category || 'General';
  document.getElementById('viewBlogAuthor').textContent  = '\u270d\ufe0f ' + (blog.author_name || 'Admin');
  document.getElementById('viewBlogDate').textContent    = '\ud83d\udcc5 ' + new Date(blog.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  document.getElementById('viewBlogContent').innerHTML   = blog.content || '';
  document.getElementById('viewBlogModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeViewBlog() {
  document.getElementById('viewBlogModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── TOGGLE PUBLISH ──
async function togglePublish(id, publish) {
  const { error } = await supabaseClient
    .from('blogs')
    .update({ is_published: publish })
    .eq('id', id);
  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  if (_blogMap[id]) _blogMap[id].is_published = publish;
  showToast(publish ? '✅ Post published!' : '📦 Post unpublished');
  loadBlogs();
}

// ── DELETE ──
let _deletePostId = null;
let _deletePostData = null;
let _deletePostTimer = null;

function deleteBlog(id) {
  _deletePostId = id;
  document.getElementById('blogDeleteModal').style.display = 'flex';
}

function closeDeletePostModal() {
  _deletePostId = null;
  document.getElementById('blogDeleteModal').style.display = 'none';
}

async function confirmDeletePost() {
  if (!_deletePostId) return;
  const btn = document.getElementById('confirmDeletePostBtn');
  btn.disabled = true;
  btn.textContent = 'Deleting...';
  _deletePostData = _blogMap[_deletePostId] || null;
  const { error } = await supabaseClient.from('blogs').delete().eq('id', _deletePostId);
  closeDeletePostModal();
  if (error) { showToast('\u274c ' + error.message, 'error'); return; }
  loadBlogs();
  showUndoPostToast();
}

function showUndoPostToast() {
  const toast = document.getElementById('undoPostToast');
  const bar   = document.getElementById('undoPostBar');
  clearTimeout(_deletePostTimer);
  toast.style.display = 'flex';
  bar.style.transition = 'none';
  bar.style.width = '100%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bar.style.transition = 'width 5s linear';
    bar.style.width = '0%';
  }));
  _deletePostTimer = setTimeout(() => {
    toast.style.display = 'none';
    _deletePostData = null;
  }, 5000);
}

async function undoDeletePost() {
  clearTimeout(_deletePostTimer);
  document.getElementById('undoPostToast').style.display = 'none';
  if (!_deletePostData) return;
  const payload = Object.assign({}, _deletePostData);
  delete payload.id;
  const { error } = await supabaseClient.from('blogs').insert([payload]);
  if (error) { showToast('\u274c Undo failed: ' + error.message, 'error'); return; }
  showToast('\u2705 Post restored!');
  loadBlogs();
  _deletePostData = null;
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to show skeleton initially
  setTimeout(() => loadBlogs(), 100);

  // ESC key closes editor
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBlogModal();
  });
});
