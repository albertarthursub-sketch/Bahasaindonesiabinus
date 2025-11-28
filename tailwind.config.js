export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translate3d(0, -30px, 0)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translate3d(0, 30px, 0)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        shimmer: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-100%)',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
        },
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        fadeInDown: 'fadeInDown 0.8s ease-out forwards',
        fadeInUp: 'fadeInUp 0.8s ease-out forwards',
        shimmer: 'shimmer 2s infinite',
        blob: 'blob 7s infinite',
      },
    }
  },
  plugins: []
};
