/* Oshadini Nilumika - Portfolio interactions
   - theme toggle (dark default, remembered)
   - mobile hamburger menu
   - project cards + modal popups
   - active nav link on scroll
   - contact form (opens the visitor's email app)
*/
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.getElementById("theme-toggle");

  function readTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  function saveTheme(value) {
    try { localStorage.setItem("theme", value); } catch (e) { /* storage unavailable */ }
  }
  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f6f9fe" : "#05070c");
  }

  applyTheme(readTheme() === "light" ? "light" : "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      saveTheme(next);
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menu-toggle");
  var navLinks = document.getElementById("nav-links");

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) setMenu(false);
  });

  /* ---------- Projects ---------- */
  var projects = [
    {
      id: "career",
      kind: "Final year project",
      title: "AI Powered Career Guidance Platform",
      sub: "In development",
      summary: "A MERN stack platform that uses machine learning to recommend suitable career paths from user profiles.",
      desc: "An AI-powered career guidance platform that analyses user profiles and recommends suitable career paths. AI-driven insights help users make informed career decisions through personalised recommendations.",
      points: [
        "Built on the MERN stack (MongoDB, Express, React, Node.js).",
        "Machine learning models analyse user profiles to rank career paths.",
        "Personalised recommendations designed to support career decisions."
      ],
      tech: ["MongoDB", "Express", "React", "Node.js", "Machine learning"]
    },
    {
      id: "lotus",
      kind: "Internship",
      title: "Lotus Pro: Procurement and Cleaning Management",
      sub: "Colombo Lotus Tower Management Company",
      summary: "Procurement Management module for the Lotus Pro web application and a Cleaning Management System.",
      desc: "Enterprise web modules built during my internship at Colombo Lotus Tower Management Company: the Procurement Management module for the Lotus Pro web application, and the Cleaning Management System.",
      points: [
        "Implemented back-end functionality in C# and .NET with front-end interfaces in HTML, CSS and JavaScript.",
        "Designed 15+ SQL Server tables and implemented back-end APIs.",
        "Managed queries, data handling and system integration.",
        "Resolved 20+ application issues through testing and debugging."
      ],
      tech: ["C#", ".NET", "SQL Server", "HTML", "CSS", "JavaScript"]
    },
    {
      id: "traffic",
      kind: "IoT project",
      title: "Smart Traffic Congestion Monitoring and Prediction",
      sub: "University project",
      summary: "Machine learning models for real-time traffic prediction and congestion analysis.",
      desc: "A smart traffic system that monitors congestion and predicts traffic conditions using machine learning.",
      points: [
        "Developed and integrated machine learning models for real-time traffic prediction.",
        "Supported congestion analysis from monitored traffic data."
      ],
      tech: ["Machine learning", "IoT", "Data preprocessing", "Model development"]
    },
    {
      id: "restaurant",
      kind: "Computing group project",
      title: "Online Restaurant Reservation System",
      sub: "Group project",
      summary: "A web-based reservation system with customer booking, table management and reservation tracking.",
      desc: "A web-based restaurant reservation system that lets customers book tables while staff manage tables and track reservations.",
      points: [
        "Customer booking flow for reserving tables.",
        "Table management for restaurant staff.",
        "Reservation tracking features."
      ],
      tech: ["Java", "JSP", "Servlets", "MySQL", "HTML", "CSS", "JavaScript"]
    },
    {
      id: "cinema",
      kind: "Java project",
      title: "Online Cinema Seat Booking System",
      sub: "Group project, team leader",
      summary: "An online seat booking system built as a group project, which I led.",
      desc: "An online cinema seat booking system developed as a group project. I contributed as the group leader and coordinated team development tasks.",
      points: [
        "Led the team and coordinated development tasks.",
        "Built the booking system with a web front end and a Java back end."
      ],
      tech: ["HTML", "CSS", "JavaScript", "Java"]
    },
    {
      id: "shop",
      kind: "Mobile application",
      title: "Online Shopping Store",
      sub: "Group project",
      summary: "A cross-platform shopping app with Firebase authentication and realtime data sync.",
      desc: "A cross-platform mobile application for online shopping, developed as a group project.",
      points: [
        "Built with Flutter and Dart for cross-platform support.",
        "Firebase handles user authentication and realtime data synchronisation."
      ],
      tech: ["Flutter", "Dart", "Firebase"]
    }
  ];

  var grid = document.getElementById("projects-grid");
  var modal = document.getElementById("project-modal");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  projects.forEach(function (p) {
    var card = el("button", "project-card");
    card.type = "button";
    card.setAttribute("data-id", p.id);
    card.setAttribute("aria-haspopup", "dialog");
    card.appendChild(el("span", "project-kind", p.kind));
    card.appendChild(el("h3", "", p.title));
    card.appendChild(el("p", "", p.summary));
    var chips = el("div", "chips");
    p.tech.slice(0, 4).forEach(function (t) { chips.appendChild(el("span", "", t)); });
    card.appendChild(chips);
    card.appendChild(el("span", "project-more", "View details →"));
    grid.appendChild(card);
  });

  var lastFocus = null;

  function openModal(id) {
    var p = projects.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    document.getElementById("modal-kind").textContent = p.kind;
    document.getElementById("modal-title").textContent = p.title;
    document.getElementById("modal-sub").textContent = p.sub;
    document.getElementById("modal-desc").textContent = p.desc;

    var list = document.getElementById("modal-points");
    list.textContent = "";
    p.points.forEach(function (pt) { list.appendChild(el("li", "", pt)); });

    var tech = document.getElementById("modal-tech");
    tech.textContent = "";
    p.tech.forEach(function (t) { tech.appendChild(el("span", "", t)); });

    lastFocus = document.activeElement;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }

  function closeModal() {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".project-card");
    if (card) openModal(card.getAttribute("data-id"));
  });
  document.getElementById("modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal(); // click on backdrop
  });

  /* ---------- Active nav link on scroll ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");
  var TO = "oshadini13@gmail.com";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;
    var ok = true;

    [name, email, message].forEach(function (f) {
      var valid = f.value.trim() !== "" && (f !== email || /^\S+@\S+\.\S+$/.test(f.value.trim()));
      f.classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });

    if (!ok) {
      note.textContent = "Please fill in your name, a valid email and a message.";
      return;
    }

    var subject = "Portfolio enquiry from " + name.value.trim();
    var body = message.value.trim() + "\n\n" + name.value.trim() + "\n" + email.value.trim();
    note.textContent = "Opening your email app. If nothing opens, write to " + TO + ".";
    window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
