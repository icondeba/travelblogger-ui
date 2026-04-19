const functionAppUrl = 'https://travelblogger-service-ebdnd3aahbfuc7hx.centralindia-01.azurewebsites.net';

export const environment = {
  production: true,
  apiBaseUrl: '',
  functionAppUrl,
  contactEndpoint: `${functionAppUrl}/api/contact-messages`,
  videosEndpoint: `${functionAppUrl}/api/videos`
};
