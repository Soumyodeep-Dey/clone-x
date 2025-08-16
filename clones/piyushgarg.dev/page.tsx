Absolutely! Below is a Next.js page that recreates https://piyushgarg.dev using modular components and Tailwind CSS.

**Directory Structure:**
```
/components
  - Hero.js
  - About.js
  - Work.js
  - Projects.js
  - Contact.js
/pages
  - index.js
```

---

### 1. `/components/Hero.js`

```jsx
// components/Hero.js
export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Hi, I'm <span className="text-indigo-400">Piyush</span> 👋
        </h1>
        <h2 className="text-2xl md:text-3xl mb-8 font-medium">
          Software Engineer <span className="text-indigo-300">&amp;</span> Indie Hacker
        </h2>
        <a
          href="#contact"
          className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold transition"
        >
          Say Hello
        </a>
      </div>
    </section>
  );
}
```

---

### 2. `/components/About.js`

```jsx
// components/About.js
export default function About() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold mb-4 text-indigo-500">About Me</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I'm a software engineer passionate about building impactful digital products and businesses. 
          Over the years, I have worked with teams at <span className="font-semibold">Google</span> 
          and <span className="font-semibold">Tracxn</span>, and collaborated with several early-stage startups.
          <br /><br />
          I specialize in developing scalable web and mobile applications, mainly using <span className="font-semibold">JavaScript/TypeScript</span>, <span className="font-semibold">React</span>, <span className="font-semibold">Node.js</span>, and <span className="font-semibold">Next.js</span>. 
          <br /><br />
          Outside work, you’ll find me tinkering with new SaaS ideas, sharing insights, or reading (and sometimes writing) about startups & life.
        </p>
      </div>
    </section>
  );
}
```

---

### 3. `/components/Work.js`

```jsx
// components/Work.js
const jobs = [
  {
    company: "Google",
    title: "Software Engineer II",
    period: "Oct 2022 – Present",
    description: "Working on Google Pay to build the future of payments in India.",
  },
  {
    company: "Tracxn",
    title: "Software Engineer",
    period: "Aug 2021 – Sep 2022",
    description: "Built B2B products at scale, and led several initiatives around performance and UX.",
  },
  {
    company: "Entrepreneurship",
    title: "Founder & Indie Hacker",
    period: "2017 – Present",
    description: "Launched products like Mailpace, Couponbytes & more. Bootstrapping side-projects into businesses.",
  },
];

export default function Work() {
  return (
    <section id="work" className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold mb-4 text-indigo-500">Work</h2>
        <div className="space-y-8">
          {jobs.map((job) => (
            <div key={job.company + job.title} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-none">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">{job.company}</div>
                  <div className="text-gray-700 dark:text-gray-300">{job.title}</div>
                </div>
                <div className="mt-2 md:mt-0 text-gray-500 dark:text-gray-400">{job.period}</div>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-400">{job.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 4. `/components/Projects.js`

```jsx
// components/Projects.js
const projects = [
  {
    name: "Mailpace",
    url: "https://mailpace.com",
    desc: "Effortless & reliable transactional email for developers. Bootstrapped to profitability.",
    tag: "Bootstrapped SaaS",
  },
  {
    name: "Couponbytes",
    url: "https://couponbytes.com",
    desc: "Curated app to discover and share best cashback & coupons.",
    tag: "Mobile App",
  },
  {
    name: "Startup resources",
    url: "https://startupresources.site",
    desc: "Handpicked tools and guides, helping founders build & scale.",
    tag: "Curation",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold mb-4 text-indigo-500">Projects</h2>
        <div className="grid gap-8">
          {projects.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {p.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mb-1">{p.desc}</div>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="inline-block bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-xs font-medium">
                    {p.tag}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 5. `/components/Contact.js`

```jsx
// components/Contact.js
const links = [
  { name: "Email", url: "mailto:me@piyushgarg.dev", icon: "mailto" },
  { name: "Twitter", url: "https://twitter.com/thepiyushgarg", icon: "twitter" },
  { name: "GitHub", url: "https://github.com/thepiyushgarg", icon: "github" },
];

const icons = {
  mailto: (
    <svg width="20" height="20" fill="none" key="mail" viewBox="0 0 24 24" className="inline-block mr-2">
      <path stroke="currentColor" strokeWidth="2" d="M4 4h16v16H4V4zm0 0l8 8 8-8"/>
    </svg>
  ),
  twitter: (
    <svg width="20" height="20" fill="none" key="tw" viewBox="0 0 24 24" className="inline-block mr-2">
      <path
        stroke="currentColor" strokeWidth="2" fill="none"
        d="M22 5.924c-.793.352-1.645.593-2.539.7a4.467 4.467 0 0 0 1.962-2.457 8.847 8.847 0 0 1-2.828 1.085A4.421 4.421 0 0 0 16.146 4a4.415 4.415 0 0 0-4.33 5.42A12.531 12.531 0 0 1 3.183 4.896a4.414 4.414 0 0 0 1.367 5.893 4.44 4.44 0 0 1-2.002-.556v.056a4.424 4.424 0 0 0 3.547 4.329c-.382.104-.786.159-1.203.159-.294 0-.578-.028-.856-.082a4.434 4.434 0 0 0 4.135 3.073A8.873 8.873 0 0 1 2 19.114a12.512 12.512 0 0 0 6.792 1.993c8.153 0 12.617-6.752 12.617-12.617 0-.192-.004-.383-.013-.573A8.988 8.988 0 0 0 24 4.557a8.684 8.684 0 0 1-2.543.697A4.426 4.426 0 0 0 22 5.924z"
      />
    </svg>
  ),
  github: (
    <svg width="20" height="20" fill="none" key="gh" viewBox="0 0 24 24" className="inline-block mr-2">
      <path stroke="currentColor" strokeWidth="2" fill="none"
        d="M12 2C6.477 2 2 6.486 2 12.021c0 4.419 2.865 8.167 6.839 9.504.499.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.37-1.343-3.37-1.343-.454-1.154-1.11-1.462-1.11-1.462-.907-.621.07-.609.07-.609 1.003.07 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.092-.647.349-1.088.636-1.339-2.221-.255-4.555-1.114-4.555-4.956 0-1.094.39-1.988 1.029-2.688-.103-.253-.446-1.273.098-2.652 0 0 .84-.27 2.75 1.025a9.564 9.564 0 0 1 2.5-.338c.849.004 1.705.115 2.5.338 1.91-1.295 2.75-1.025 2.75-1.025.546 1.379.202 2.399.1 2.652.64.7 1.029 1.594 1.029 2.688 0 3.849-2.337 4.698-4.566 4.948.356.307.674.91.674 1.834 0 1.323-.012 2.391-.012 2.717 0 .268.181.579.688.482A10.006 10.006 0 0 0 22 12.021C22 6.486 17.523 2 12 2z"
      />
    </svg>
  ),
};

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-indigo-500">Contact</h2>
        <p className="mb-8 text-gray-700 dark:text-gray-300">
          Got an interesting idea, want to say Hi or collaborate?<br />
          Drop me a message or reach out on socials!
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          {links.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-2 bg-indigo-500 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
            >
              {icons[link.icon]} {link.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 6. `/pages/index.js`

```jsx
// pages/index.js
import Hero from '../components/Hero'
import About from '../components/About'
import Work from '../components/Work'
import Projects from '../components/Projects'
import Contact from '../components/Contact'

export default function Home() {
  return (
    <main className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <Hero />
      <About />
      <Work />
      <Projects />
      <Contact />
      <footer className="py-8 text-center text-gray-400 dark:text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Piyush Garg. Made with <span className="text-indigo-400 font-semibold">React & Next.js</span>
      </footer>
    </main>
  )
}
```

---

**Add Tailwind CSS to your project** by following the [official Tailwind Next.js documentation](https://tailwindcss.com/docs/guides/nextjs).

**Theme/Colors:**  
- Light/dark backgrounds can be toggled via Tailwind's `dark:` classes.
- Slight style tweaks for modern look and accessibility.

**Navigation:**  
This version omits a sticky navigation bar, as https://piyushgarg.dev also doesn't have one, and uses sections and anchor links as per the site.

**You now have a modular Next.js site matching the structure and look of https://piyushgarg.dev!**