package com.feedbackai.service.oauth;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class OAuthHandlerFactory {

    private final Map<String, OAuthHandler> handlers;

    public OAuthHandlerFactory(List<OAuthHandler> handlerList) {
        handlers = handlerList.stream()
                .collect(Collectors.toMap(OAuthHandler::getPlatformName, h -> h));
    }

    public OAuthHandler getHandler(String platform) {
        OAuthHandler handler = handlers.get(platform.toLowerCase());
        if (handler == null) {
            throw new IllegalArgumentException(
                    "Unsupported platform: " + platform +
                    ". Supported: " + String.join(", ", handlers.keySet()));
        }
        return handler;
    }
}
