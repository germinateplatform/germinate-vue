# Germinate - The generic plant genetic resources database

<p align="center">
  <img src="https://raw.githubusercontent.com/germinateplatform/germinate-vue/master/public/img/germinate-square.svg?sanitize=true" width="200" alt="Logo">
</p>

![GitHub](https://img.shields.io/github/license/germinateplatform/germinate-vue)
![GitHub package.json version](https://img.shields.io/github/package-json/v/germinateplatform/germinate-vue)
![GitHub last commit](https://img.shields.io/github/last-commit/germinateplatform/germinate-vue)

Germinate is an open source plant database infrastructure and application programming platform
on which complex data from genetic resource collections can be stored, queried and visualized
using common, reusable, programming components. Germinate utilises modern web and database
standards to provide a common architecture and high performance web-based user interface and
analytics functionality across a wide variety of data types including: passport, phenotypic,
field trial, pedigree, genetic, climatic, geographic location data as well as user-submitted
annotations. In addition, it provides links to an expanding variety of external visualization
and analysis tools such as [Helium](https://ics.hutton.ac.uk/helium) for pedigree visualization,
[Flapjack](https://ics.hutton.ac.uk/flapjack) for graphical genotyping and
[CurlyWhirly](https://ics.hutton.ac.uk/curlywhirly) for 3D coordinate data.

The single point of access for all background data on genetic resources collections that
Germinate implements, provides a valuable digital curation resource as well as offering
essential continuity on how new data is recorded and presented to researchers and breeders
which brings focus and facilitates community building into research communities.

## Website
Want to know more? Browse our homepage ([https://ics.hutton.ac.uk/get-germinate](https://ics.hutton.ac.uk/get-germinate))

## Interactive Demo Instance
If you want to explore Germinate and try out all the features, have a play about with our [demo database](https://ics.hutton.ac.uk/germinate-demo).

## Download
Please consult the [online documentation](https://germinateplatform.github.io/germinate-server) for a variety of options to download and run Germinate yourself.

## Contact
If you have any questions or suggestions, please send us an email on [germinate@hutton.ac.uk](mailto:germinate@hutton.ac.uk) or post an issue.

## Acknowledgements
The Germinate Team gratefully acknowledges support by the following organizations who have generously provided us with open source licenses for their software products:

### Lokalise

<svg xmlns="http://www.w3.org/2000/svg" width="130" height="28" viewBox="0 0 130 28" fill="none"> <g clip-path="url(#clip0)"> <path d="M24.2748 17.4004H19.9835H17.1328H16.4287L12.1374 21.6911L7.84608 17.4004H7.14196H4.2913H0V21.6911H6.06839L9.10289 24.7256L12.1374 27.7601L15.1719 24.7256L18.2058 21.6911H24.2748V17.4004Z" fill="#FF6336"/> <path d="M24.2748 8.81641H0V13.1077H24.2748V8.81641Z" fill="#FFC500"/> <path d="M24.2748 0.234375H0V4.52568H24.2748V0.234375Z" fill="#A4A14A"/> <path d="M33.9258 0.234375H37.7863V21.292H33.9258V0.234375Z" fill="black"/> <path d="M43.7951 20.6922C42.576 20.0193 41.6109 19.0983 40.8997 17.9281C40.1873 16.7585 39.832 15.4711 39.832 14.0676C39.832 12.664 40.1873 11.3772 40.8997 10.207C41.6109 9.03736 42.576 8.11582 43.7951 7.44293C45.013 6.77004 46.3347 6.43359 47.7582 6.43359C49.1812 6.43359 50.5022 6.77004 51.7213 7.44293C52.9392 8.11582 53.9044 9.03678 54.6167 10.207C55.3279 11.3766 55.6844 12.664 55.6844 14.0676C55.6844 15.4711 55.3285 16.7579 54.6167 17.9281C53.9044 19.0977 52.9392 20.0193 51.7213 20.6922C50.5022 21.3651 49.1812 21.7015 47.7582 21.7015C46.3347 21.7015 45.0136 21.3651 43.7951 20.6922ZM49.791 17.6217C50.405 17.2806 50.897 16.798 51.2676 16.174C51.6376 15.55 51.8238 14.8483 51.8238 14.0681C51.8238 13.2886 51.6382 12.5868 51.2676 11.9623C50.897 11.3383 50.405 10.8557 49.791 10.5145C49.1771 10.1734 48.4989 10.0025 47.7582 10.0025C47.017 10.0025 46.34 10.1734 45.7254 10.5145C45.1114 10.8557 44.6188 11.3383 44.2482 11.9623C43.877 12.5862 43.6926 13.2886 43.6926 14.0681C43.6926 14.8483 43.877 15.55 44.2482 16.174C44.6183 16.798 45.1108 17.2806 45.7254 17.6217C46.3394 17.9629 47.0164 18.1338 47.7582 18.1338C48.4989 18.1332 49.1765 17.9629 49.791 17.6217Z" fill="black"/> <path d="M57.7305 0.234375H61.591V12.7813L66.6212 6.84426H71.2124L65.5388 13.5419L71.6219 21.292H66.6795L61.591 14.5943V21.292H57.7305V0.234375Z" fill="black"/> <path d="M75.2644 20.766C74.182 20.142 73.3047 19.2499 72.6324 18.0898C71.9595 16.9302 71.623 15.5891 71.623 14.0683C71.623 12.6842 71.9448 11.4068 72.5882 10.2372C73.2316 9.0676 74.109 8.14134 75.2208 7.45903C76.3321 6.77671 77.55 6.43555 78.8764 6.43555C79.8121 6.43555 80.6652 6.59169 81.4348 6.90339C82.2049 7.21509 82.7947 7.63461 83.2042 8.16079V6.84447H87.0648V21.2922H83.2042V19.9759C82.5997 20.5415 81.9562 20.9699 81.2739 21.2627C80.591 21.555 79.7137 21.7017 78.6413 21.7017C77.4723 21.7023 76.3468 21.39 75.2644 20.766ZM82.298 16.9644C83.0192 16.1848 83.3804 15.2197 83.3804 14.0689C83.3804 12.9188 83.0192 11.9536 82.298 11.1735C81.5768 10.3939 80.6211 10.0039 79.432 10.0039C78.2424 10.0039 77.2866 10.3945 76.5654 11.1735C75.8442 11.9536 75.4836 12.9188 75.4836 14.0689C75.4836 15.2197 75.8442 16.1848 76.5654 16.9644C77.2866 17.7445 78.2418 18.134 79.432 18.134C80.6211 18.134 81.5768 17.7445 82.298 16.9644Z" fill="black"/> <path d="M89.873 0.234375H93.7337V21.292H89.873V0.234375Z" fill="black"/> <path d="M96.7467 4.15283C96.2788 3.68499 96.0449 3.11934 96.0449 2.45647C96.0449 1.77415 96.2788 1.19435 96.7467 0.716494C97.2145 0.239224 97.7802 0 98.4431 0C99.1249 0 99.7053 0.239224 100.183 0.716494C100.66 1.19435 100.9 1.77415 100.9 2.45647C100.9 3.11934 100.661 3.68499 100.183 4.15283C99.7053 4.62068 99.1249 4.8546 98.4431 4.8546C97.7802 4.85519 97.2145 4.62068 96.7467 4.15283ZM96.5416 6.84381H100.402V21.2915H96.5416V6.84381Z" fill="black"/> <path d="M103.035 20.2948L103.913 16.6682H104.088C105.355 17.6434 106.652 18.1306 107.978 18.1306C108.524 18.1306 108.967 18.0281 109.309 17.8237C109.65 17.6192 109.821 17.3222 109.821 16.9316C109.821 16.5221 109.62 16.1909 109.221 15.9376C108.821 15.6842 108.075 15.3725 106.984 15.0013C105.873 14.6313 105.01 14.0945 104.396 13.3927C103.782 12.6909 103.474 11.8625 103.474 10.9068C103.474 9.56159 103.976 8.47919 104.98 7.66017C105.984 6.84115 107.256 6.43164 108.797 6.43164C109.577 6.43164 110.269 6.5047 110.874 6.65083C111.478 6.79696 112.053 7.03618 112.599 7.36732L112.746 11.0523H112.541C111.839 10.6039 111.215 10.2681 110.669 10.0436C110.123 9.81967 109.509 9.70712 108.827 9.70712C108.339 9.70712 107.939 9.80494 107.628 9.99938C107.316 10.1944 107.16 10.4484 107.16 10.7601C107.16 11.1696 107.355 11.506 107.745 11.7694C108.134 12.0328 108.866 12.3498 109.938 12.7198C111.166 13.1293 112.097 13.6266 112.731 14.2117C113.365 14.7962 113.682 15.703 113.682 16.9316C113.682 17.9456 113.428 18.8135 112.921 19.5348C112.414 20.2565 111.746 20.7975 110.917 21.1581C110.089 21.5187 109.177 21.699 108.183 21.699C106.174 21.699 104.458 21.2311 103.035 20.2948Z" fill="black"/> <path d="M119.12 20.6763C117.911 19.9939 116.961 19.063 116.269 17.8834C115.576 16.7037 115.23 15.3927 115.23 13.9497C115.23 12.5462 115.557 11.2735 116.21 10.1333C116.864 8.99258 117.771 8.09107 118.931 7.4282C120.09 6.76533 121.402 6.43359 122.864 6.43359C124.345 6.43359 125.628 6.78006 126.71 7.4718C127.791 8.16414 128.61 9.08509 129.166 10.2358C129.722 11.3866 130 12.6245 130 13.9503V15.091H118.915C119.149 16.1834 119.651 17.0119 120.421 17.577C121.192 18.1426 122.21 18.4248 123.478 18.4248C125.408 18.4248 127.094 17.7914 128.537 16.524H128.947L128.8 20.1795C127.923 20.6869 126.997 21.0669 126.022 21.3203C125.047 21.5736 124.111 21.7003 123.214 21.7003C121.694 21.6997 120.329 21.3586 119.12 20.6763ZM126.14 12.4578C126.042 11.5804 125.676 10.8928 125.043 10.3961C124.409 9.8994 123.634 9.65016 122.718 9.65016C121.821 9.65016 121.036 9.88938 120.363 10.3666C119.691 10.8445 119.237 11.5416 119.003 12.4578H126.14Z" fill="black"/> </g> <defs> <clipPath id="clip0"> <rect width="130" height="27.7588" fill="white"/> </clipPath> </defs> </svg>

We use [Lokalise](https://lokalise.co/) to manage Germinate's translations.

<img src="https://raw.githubusercontent.com/germinateplatform/germinate-vue/master/public/img/hutton-black.svg?sanitize=true" height="150" alt="The James Hutton Institute logo">
<br />
<img src="https://raw.githubusercontent.com/germinateplatform/germinate-vue/master/public/img/ics-sdg-black.svg?sanitize=true" height="150" alt="Software Development Group logo">