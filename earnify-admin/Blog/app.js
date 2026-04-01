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

// ── RICH TEXT EDITOR HELPERS ──
function rte(cmd) {
  document.getElementById('blogContent').focus();
  document.execCommand(cmd, false, null);
}

function rteBlock(tag) {
  document.getElementById('blogContent').focus();
  document.execCommand('formatBlock', false, tag);
}

function rteLink() {
  const url = prompt('Enter URL:');
  if (url) {
    document.getElementById('blogContent').focus();
    document.execCommand('createLink', false, url);
  }
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
    category:     document.getElementById('blogCategory').value.trim(),
    excerpt:      document.getElementById('blogExcerpt').value.trim(),
    content,
    image_url:    imageUrl,
    author_email: authorEmail,
    author_name:  authorName,
  };

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
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⏳</div>
      <h3>Loading...</h3>
    </div>`;

  try {
    const { data: blogs, error } = await supabaseClient
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const count = blogs ? blogs.length : 0;
    document.getElementById('blogCount').textContent = `${count} post${count !== 1 ? 's' : ''}`;

    if (!blogs || blogs.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✍️</div>
          <h3>No Blog Posts Yet</h3>
          <p>Click "Add Blog Post" to create your first post!</p>
        </div>`;
      return;
    }

    grid.innerHTML = blogs.map(b => {
      // Strip HTML tags for excerpt preview
      const plainText = b.excerpt || b.content?.replace(/<[^>]*>/g, '').substring(0, 120) || '';
      return `
      <div class="blog-card">
        <div class="blog-card-img">
          ${b.image_url ? `<img src="${b.image_url}" alt="" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="blog-card-body">
          <div class="blog-card-title">${b.title}</div>
          <span class="blog-category">${b.category || 'General'}</span>
          <div class="blog-card-actions">
            <button class="btn-edit-blog" onclick="openEditModal(${JSON.stringify(b).replace(/"/g, '&quot;')})">Edit</button>
            <button class="btn-delete-blog" onclick="deleteBlog(${b.id})">Delete</button>
          </div>
        </div>
      </div>`;
    }).join('');
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

// ── DELETE ──
async function deleteBlog(id) {
  if (!confirm('Delete this blog post?')) return;
  const { error } = await supabaseClient.from('blogs').delete().eq('id', id);
  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  showToast('🗑️ Post deleted');
  loadBlogs();
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadBlogs();

  // ESC key closes editor
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBlogModal();
  });
});
