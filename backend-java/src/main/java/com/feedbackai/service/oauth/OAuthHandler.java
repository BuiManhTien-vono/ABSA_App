package com.feedbackai.service.oauth;

import com.feedbackai.dto.response.OAuthTokenResponse;

public interface OAuthHandler {
    String getAuthorizeUrl(String state);
    OAuthTokenResponse exchangeCodeForToken(String code);
    String getPlatformName();
}
