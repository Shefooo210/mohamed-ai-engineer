(() => {
  const config = window.MOHAMED_INQUIRY_CONFIG;
  const login = document.getElementById('login');
  const dashboard = document.getElementById('dashboard');
  const loginMessage = document.getElementById('login-message');
  const dashboardMessage = document.getElementById('dashboard-message');
  const list = document.getElementById('request-list');
  const count = document.getElementById('count');
  const ownerEmail = 'shefooo210@gmail.com';
  if (!config?.url || !config?.publishableKey || !window.supabase) {
    loginMessage.textContent = 'Sign-in service unavailable. Please try again later.';
    return;
  }
  const client = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }
  });
  let active = false;

  function showError(element, message) {
    element.textContent = message;
    element.classList.add('error');
  }
  function showDashboard(allowed) {
    active = allowed;
    login.classList.toggle('hidden', allowed);
    dashboard.classList.toggle('hidden', !allowed);
    if (!allowed) list.replaceChildren();
  }
  function make(tag, text = '', className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function draw(records) {
    list.replaceChildren();
    count.textContent = `${records.length} project request${records.length === 1 ? '' : 's'}`;
    if (!records.length) {
      list.append(make('p', 'No project requests yet.', 'empty'));
      return;
    }
    for (const item of records) {
      const card = make('article', '', 'request');
      const head = make('div', '', 'request-head');
      const heading = make('div');
      heading.append(make('h2', item.name), make('p', new Date(item.created_at).toLocaleString(), 'meta'));
      const select = document.createElement('select');
      select.setAttribute('aria-label', `Status for ${item.name}`);
      for (const value of ['new', 'reviewing', 'replied']) {
        const option = make('option', value);
        option.value = value;
        select.append(option);
      }
      select.value = item.status;
      select.addEventListener('change', async () => {
        const previous = item.status;
        select.disabled = true;
        const { data, error } = await client.from('project_inquiries').update({ status: select.value }).eq('id', item.id).select('id,status').single();
        select.disabled = false;
        if (error || !data) {
          select.value = previous;
          showError(dashboardMessage, 'Could not update the status. Please try again.');
        } else {
          item.status = data.status;
          dashboardMessage.textContent = 'Status saved.';
          dashboardMessage.classList.remove('error');
        }
      });
      head.append(heading, select);
      const email = document.createElement('a');
      email.href = `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent('Re: your project request')}`;
      email.textContent = item.email;
      card.append(head, make('p', item.service, 'service'), make('p', item.project_details, 'details'), email);
      list.append(card);
    }
  }
  async function refresh() {
    dashboardMessage.textContent = 'Loading requests…';
    dashboardMessage.classList.remove('error');
    const { data, error } = await client.from('project_inquiries')
      .select('id,name,email,service,project_details,status,created_at')
      .order('created_at', { ascending: false }).limit(100);
    if (error) {
      showError(dashboardMessage, 'Could not load requests. Check your sign-in and try again.');
      return;
    }
    draw(data || []);
    dashboardMessage.textContent = data?.length === 100 ? 'Showing the latest 100 requests.' : '';
  }
  async function checkOwner() {
    const { data, error } = await client.auth.getUser();
    const allowed = !error && data?.user?.email?.toLowerCase() === ownerEmail;
    showDashboard(allowed);
    if (allowed) await refresh();
    else if (data?.user) showError(loginMessage, 'This account is not authorized to view requests.');
  }
  document.getElementById('send-link').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    loginMessage.classList.remove('error');
    loginMessage.textContent = 'Sending sign-in link…';
    const { error } = await client.auth.signInWithOtp({
      email: ownerEmail,
      options: { emailRedirectTo: location.href.split('#')[0], shouldCreateUser: true }
    });
    button.disabled = false;
    if (error) showError(loginMessage, `Could not send the sign-in link: ${error.message}`);
    else loginMessage.textContent = 'Check your email for a sign-in link, then return to this page.';
  });
  document.getElementById('refresh').addEventListener('click', refresh);
  document.getElementById('sign-out').addEventListener('click', async () => {
    await client.auth.signOut();
    showDashboard(false);
    loginMessage.textContent = 'Signed out.';
  });
  client.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_IN' && !active) setTimeout(checkOwner, 0);
    if (event === 'SIGNED_OUT') showDashboard(false);
  });
  checkOwner();
})();
