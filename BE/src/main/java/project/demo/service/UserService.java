package project.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.demo.dto.TaskDtos;
import project.demo.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskDtos.UserBrief> listActiveUsers() {
        return userRepository.findAllByIsActiveTrue()
                .stream()
                .map(u -> new TaskDtos.UserBrief(
                        u.getId(),
                        u.getEmail(),
                        u.getFullName()
                ))
                .toList();
    }
}
