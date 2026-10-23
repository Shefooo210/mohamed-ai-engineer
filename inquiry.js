(() => {
  const form = document.getElementById('inquiry-form');
  const status = document.getElementById('inquiry-status');
  const button = form?.querySelector('button[type="submit"]');
  const config = window.MOHAMED_INQUIRY_CONFIG;
  const arabic = document.documentElement.lang === 'ar';
  if (!form || !status || !button) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements._honey.value.trim()) return;
    if (!config?.url || !config?.publishableKey) {
      status.textContent = arabic ? 'خدمة الطلبات غير متاحة مؤقتًا. حاول مرة تانية لاحقًا.' : 'The request service is temporarily unavailable. Please try again later.';
      return;
    }
    const fields = new FormData(form);
    const payload = {
      name: String(fields.get('name') || '').trim(),
      email: String(fields.get('email') || '').trim(),
      service: String(fields.get('service') || ''),
      project_details: String(fields.get('project_details') || '').trim()
    };
    button.disabled = true;
    status.textContent = arabic ? 'بنحفظ طلبك…' : 'Saving your request…';
    try {
      const response = await fetch(`${config.url}/rest/v1/project_inquiries`, {
        method: 'POST',
        headers: { 'apikey': config.publishableKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Request service returned ${response.status}`);
      form.reset();
      status.textContent = arabic ? 'تم حفظ طلبك. هنراجعه ونرد عليك على بريدك الإلكتروني.' : 'Your request was saved. We will review it and reply to your email.';
    } catch (error) {
      console.error('Inquiry submission failed:', error);
      status.textContent = arabic ? 'الطلب ما اتحفظش. حاول تاني أو ابعت التفاصيل على البريد الظاهر في الصفحة.' : 'Your request could not be saved. Please try again later, or use the email link on this page.';
    } finally {
      button.disabled = false;
    }
  });
})();
