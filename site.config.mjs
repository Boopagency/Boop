export const site = {
  name: 'Boop',
  url: 'https://deumboop.com.br',
  email: 'contato@deumboop.com.br',
  description: 'Consultoria de gestão de marca e crescimento. Estratégia, conteúdo, sites e tecnologia para transformar a direção do negócio em execução.',
  instagram: 'https://www.instagram.com/boop.oficial_/',
  socialImage: '/assets/boop-og.jpg',
  people: [
    { name: 'Jabez Oliveira', jobTitle: 'Fundador e CEO', image: 'founder-jabez.webp', founder: true },
    { name: 'Renatha', jobTitle: 'Fundadora e CMO', image: 'founder-renatha.webp', founder: true },
    { name: 'Leonardo Beker', jobTitle: 'COO', image: 'team-leonardo.webp', founder: false },
  ],
};
export const pages = [
  { path: '/', file: 'index.html', title: 'Gestão de marca e crescimento | Boop', description: site.description, index: true },
  { path: '/privacidade/', file: 'privacidade/index.html', title: 'Privacidade | Boop', description: 'Como funcionam o contato por e-mail, os conteúdos externos e a privacidade neste site da Boop.', index: true },
  { path: '/404.html', file: '404.html', title: 'Página não encontrada | Boop', description: 'Não encontramos esta página. Volte ao início ou converse com a Boop.', index: false },
];
