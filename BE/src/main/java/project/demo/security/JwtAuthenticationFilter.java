package project.demo.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import project.demo.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.equals("/swagger-ui.html")
                || path.equals("/health")
                || path.equals("/auth/login")
                || path.equals("/auth/register");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, java.io.IOException {

        String auth = request.getHeader("Authorization");

        if (auth != null && auth.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String token = auth.substring(7);

            try {
                Claims claims = jwtProvider.parse(token).getPayload();
                Long userId = Long.valueOf(claims.getSubject());

                userRepository.findById(userId).ifPresent(user -> {
                    if (!user.isActive()) return;

                    var principal = new CustomUserDetails(user);
                    var authentication = new UsernamePasswordAuthenticationToken(
                            principal, null, principal.getAuthorities()
                    );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });

            } catch (Exception ex) {
                // log.debug("Invalid JWT token: {}", ex.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}
