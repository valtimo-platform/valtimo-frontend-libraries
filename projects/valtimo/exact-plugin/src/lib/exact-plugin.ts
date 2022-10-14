import {PluginConfigurationData} from '@valtimo/plugin';

interface ExactPluginConfig extends PluginConfigurationData {
  clientId: String;
  clientSecret: String;
  accessToken: String;
  accessTokenExpiresOn: Date;
  refreshToken: String;
  refreshTokenExpiresOn: Date;
}

export {ExactPluginConfig};
