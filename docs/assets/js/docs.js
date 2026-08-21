// ─── N.A.R.U. Modern Documentation Interactive Client Engine ─────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const docsSidebar = document.getElementById('docsSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  function toggleMobileMenu() {
    if (!docsSidebar) return;
    const isOpen = docsSidebar.classList.contains('open');
    if (isOpen) {
      docsSidebar.classList.remove('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    } else {
      docsSidebar.classList.add('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', toggleMobileMenu);
  }

  // 2. Tabbed Code Blocks Switcher
  const tabContainers = document.querySelectorAll('.code-tabs');
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');
    const copyBtn = container.querySelector('.copy-btn');

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        if (contents[idx]) {
          contents[idx].classList.add('active');
        }
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const activeContent = container.querySelector('.tab-content.active');
        if (activeContent) {
          const text = activeContent.textContent.trim();
          try {
            await navigator.clipboard.writeText(text);
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            setTimeout(() => {
              copyBtn.innerHTML = originalHtml;
            }, 2000);
          } catch (e) {
            console.error('Failed to copy', e);
          }
        }
      });
    }
  });

  // 3. Dynamic Table of Contents (TOC) with Scroll-Spy
  const tocList = document.getElementById('tocList');
  const headings = document.querySelectorAll('.docs-main h2, .docs-main h3');

  if (tocList && headings.length > 0) {
    headings.forEach((heading, idx) => {
      if (!heading.id) {
        heading.id = 'heading-' + idx + '-' + heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const li = document.createElement('li');
      li.className = 'toc-item';
      if (heading.tagName.toLowerCase() === 'h3') {
        li.style.paddingLeft = '12px';
      }

      const a = document.createElement('a');
      a.className = 'toc-link';
      a.href = '#' + heading.id;
      a.textContent = heading.textContent.trim();

      li.appendChild(a);
      tocList.appendChild(li);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.toc-link').forEach(link => {
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '0px 0px -75% 0px', threshold: 0.1 });

    headings.forEach(h => observer.observe(h));
  } else if (document.getElementById('docsToc')) {
    document.getElementById('docsToc').style.display = 'none';
  }

  // 4. Initialize Mermaid Diagrams
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#090D16',
        primaryColor: '#6366F1',
        primaryTextColor: '#F8FAFC',
        lineColor: '#06B6D4'
      }
    });
  }
});
