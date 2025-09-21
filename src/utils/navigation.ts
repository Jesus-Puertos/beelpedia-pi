// Enlaces principales para la barra de navegación
const navBarLinks = [
  { name: "Inicio", url: "/" },
  { name: "Explorar", url: "/explorar" },
  { name: "Colaboradores", url: "/colaboradores" },
  { name: "Clientes", url: "/clientes" },
  { name: "Equipo", url: "/equipo" },
];

// Enlaces para el footer
const footerLinks = [
  {
    section: "BeelPedia",
    links: [
      { name: "Sobre nosotros", url: "/equipo" },
      { name: "Colaboradores", url: "/colaboradores" },
      { name: "Clientes", url: "/clientes" },
    ],
  },
  {
    section: "Recursos",
    links: [
      { name: "Contacto", url: "/contacto" },
      { name: "Soporte", url: "/soporte" },
      { name: "Documentación", url: "/docs" },
      { name: "Blog", url: "/blog" }, // si decides activarlo
    ],
  },
  {
    section: "Legal",
    links: [
      { name: "Términos", url: "/terminos" },
      { name: "Privacidad", url: "/privacidad" },
      { name: "Licencia", url: "/licencia" },
    ],
  },
];

// Enlaces para íconos sociales
const socialLinks = {
  facebook: "https://www.facebook.com/",
  twitter: "https://twitter.com/",
  github: "https://github.com/", // tu repo si es público
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};
