/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /* AVIF d'abord : à qualité égale, environ moitié moins d'octets que le
       WebP sur les illustrations peintes (capitaine, barre). Sur une
       connexion lente, ce sont elles qui retardent le hero. */
    formats: ["image/avif", "image/webp"],
    /* Les images de projets téléversées sont servies par le stockage objet
       Neon. Sans cette autorisation, next/image refuse de les optimiser.

       Le sous-domaine porte l'identifiant de la branche Neon
       (br-xxxx.storage…) : on utilise un motif plutôt qu'un hôte figé, sinon
       chaque changement de branche casserait toutes les images. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.storage.c-4.us-east-2.aws.neon.tech",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
