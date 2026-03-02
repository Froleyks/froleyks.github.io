// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-software",
          title: "software",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-received-the-cav25-distinguished-paper-award-for-introducing-certificates-to-the-hardware-model-checking-competition",
          title: 'Received the CAV25 Distinguished Paper Award for Introducing Certificates to the Hardware Model...',
          description: "",
          section: "News",},{id: "news-defended-my-phd-thesis-on-the-deep-integration-of-sat-solving-and-model-checking",
          title: 'Defended my PhD thesis on the Deep Integration of SAT Solving and Model...',
          description: "",
          section: "News",},{id: "news-started-my-postdoc-with-prof-bogaerts",
          title: 'Started my Postdoc with Prof. Bogaerts',
          description: "",
          section: "News",},{id: "projects-certifaiger",
          title: 'Certifaiger',
          description: "Certificate checker for AIGER",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_certifaiger/";
            },},{id: "projects-cadical",
          title: 'CaDiCaL',
          description: "Incremental SAT Solver with linear Proofs",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_cadical/";
            },},{id: "projects-cadiback",
          title: 'CadiBack',
          description: "CaDiCaL BackBone Analyzer",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_cadiback/";
            },},{id: "projects-cerbtora",
          title: 'Cerbtora',
          description: "Certificate checker for Btor2",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_cerbtora/";
            },},{id: "projects-voiraig",
          title: 'Voiraig',
          description: "The first certifying model checker",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_voiraig/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6E%66%72%6F%6C%65%79%6B%73@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=FOLbe5kAAAAJ", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/froleyks", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0003-3925-3438", "_blank");
        },
      },{
        id: 'social-dblp',
        title: 'DBLP',
        section: 'Socials',
        handler: () => {
          window.open("https://dblp.org/pid/201/5325.html", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/nils-froleyks-84560b339", "_blank");
        },
      },{
        id: 'social-telegram',
        title: 'telegram',
        section: 'Socials',
        handler: () => {
          window.open("https://telegram.me/froleyks", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
