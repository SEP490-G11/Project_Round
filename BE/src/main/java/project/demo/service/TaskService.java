package project.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.demo.dto.TaskDtos;
import project.demo.entity.*;
import project.demo.enums.*;
import project.demo.repository.*;
import project.demo.spec.TaskSpecifications;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SubTaskRepository subTaskRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final TaskLogRepository taskLogRepository;
    private final NotificationService notificationService;

    // ================= TASK CRUD =================

    @Transactional
    public TaskDtos.TaskSummaryResponse createTask(Long actorId, TaskDtos.CreateTaskRequest req) {
        User actor = mustUser(actorId);
        mustAdmin(actor);

        User assignee = req.assigneeId() == null ? null : mustUser(req.assigneeId());

        Task task = taskRepository.save(
                Task.builder()
                        .title(req.title())
                        .description(req.description())
                        .priority(req.priority())
                        .status(TaskStatus.TODO)
                        .dueDate(req.dueDate())
                        .tags(req.tags() == null ? new HashSet<>() : new HashSet<>(req.tags()))
                        .createdBy(actor)
                        .assignee(assignee)
                        .active(true)
                        .build()
        );

        log(task, actor, TaskLogAction.CREATED, null, null, null);

        if (assignee != null) {
            notify(assignee.getId(), actor.getId(),
                    NotificationType.TASK_ASSIGNED,
                    "You were assigned to task: " + task.getTitle(),
                    task.getId());

            log(task, actor, TaskLogAction.ASSIGNED,
                    "assigneeId", null, String.valueOf(assignee.getId()));
        }

        return toSummary(task);
    }

    @Transactional(readOnly = true)
    public Page<TaskDtos.TaskSummaryResponse> listTasks(
            Long actorId,
            String q,
            TaskStatus status,
            TaskPriority priority,
            Long assigneeId,
            LocalDate dueFrom,
            LocalDate dueTo,
            String tag,
            Pageable pageable
    ) {
        User actor = mustUser(actorId);

        if (actor.getRole() != Role.ADMIN) {
            assigneeId = actor.getId();
        }

        Specification<Task> spec = TaskSpecifications.activeOnly()
                .and(TaskSpecifications.keyword(q))
                .and(TaskSpecifications.status(status))
                .and(TaskSpecifications.priority(priority))
                .and(TaskSpecifications.assigneeId(assigneeId))
                .and(TaskSpecifications.dueFrom(dueFrom))
                .and(TaskSpecifications.dueTo(dueTo))
                .and(TaskSpecifications.tag(tag));

        return taskRepository.findAll(spec, pageable).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public TaskDtos.TaskDetailResponse getTaskDetail(Long actorId, Long taskId) {
        User actor = mustUser(actorId);
        Task task = mustActiveTask(taskId);
        assertCanAccessTask(actor, task);

        return new TaskDtos.TaskDetailResponse(
                toSummary(task),
                subTaskRepository.findAllByTaskIdAndActiveTrue(taskId).stream().map(this::toSub).toList(),
                taskCommentRepository.findAllByTaskIdOrderByCreatedAtAsc(taskId).stream().map(this::toComment).toList(),
                taskLogRepository.findAllByTaskIdOrderByCreatedAtDesc(taskId).stream().map(this::toLog).toList()
        );
    }

    @Transactional
    public TaskDtos.TaskSummaryResponse patchTask(Long actorId, Long taskId, TaskDtos.PatchTaskRequest req) {
        User actor = mustUser(actorId);
        mustAdmin(actor);

        Task task = mustActiveTask(taskId);

        if (req.title() != null && !Objects.equals(req.title(), task.getTitle())) {
            log(task, actor, TaskLogAction.UPDATED,
                    "title", task.getTitle(), req.title());
            task.setTitle(req.title());
        }

        if (req.description() != null && !Objects.equals(req.description(), task.getDescription())) {
            log(task, actor, TaskLogAction.UPDATED,
                    "description", task.getDescription(), req.description());
            task.setDescription(req.description());
        }

        if (req.priority() != null && req.priority() != task.getPriority()) {
            log(task, actor, TaskLogAction.UPDATED,
                    "priority", task.getPriority().name(), req.priority().name());
            task.setPriority(req.priority());
        }

        if (req.dueDate() != null && !Objects.equals(req.dueDate(), task.getDueDate())) {
            log(task, actor, TaskLogAction.UPDATED,
                    "dueDate", String.valueOf(task.getDueDate()), String.valueOf(req.dueDate()));
            task.setDueDate(req.dueDate());
        }

        if (req.tags() != null) {
            log(task, actor, TaskLogAction.UPDATED, "tags",
                    String.valueOf(task.getTags()), String.valueOf(req.tags()));
            task.setTags(new HashSet<>(req.tags()));
        }

        return toSummary(taskRepository.save(task));
    }

    // ================= ASSIGN =================

    @Transactional
    public TaskDtos.TaskSummaryResponse assignTask(Long actorId, Long taskId, Long assigneeId) {
        User actor = mustUser(actorId);
        mustAdmin(actor);

        Task task = mustActiveTask(taskId);
        User assignee = mustUser(assigneeId);

        Long old = task.getAssignee() == null ? null : task.getAssignee().getId();
        task.setAssignee(assignee);
        taskRepository.save(task);

        log(task, actor, TaskLogAction.ASSIGNED,
                "assigneeId", String.valueOf(old), String.valueOf(assigneeId));

        notify(assignee.getId(), actor.getId(),
                NotificationType.TASK_ASSIGNED,
                "You were assigned to task: " + task.getTitle(),
                task.getId());

        return toSummary(task);
    }

    // ================= STATUS =================

    @Transactional
    public TaskDtos.TaskSummaryResponse updateStatus(Long actorId, Long taskId, TaskStatus status) {
        User actor = mustUser(actorId);
        Task task = mustActiveTask(taskId);
        assertCanAccessTask(actor, task);

        if (task.getStatus() != status) {
            log(task, actor, TaskLogAction.STATUS_CHANGED,
                    "status", task.getStatus().name(), status.name());

            task.setStatus(status);
            taskRepository.save(task);

            if (task.getAssignee() != null) {
                notify(task.getAssignee().getId(), actor.getId(),
                        NotificationType.TASK_STATUS_CHANGED,
                        "Task status changed: " + task.getTitle() + " → " + status,
                        task.getId());
            }
        }
        return toSummary(task);
    }

    // ================= DELETE =================

    @Transactional
    public void softDeleteTask(Long actorId, Long taskId) {
        User actor = mustUser(actorId);
        mustAdmin(actor);

        Task task = mustActiveTask(taskId);
        task.setActive(false);
        task.setDeletedAt(Instant.now());
        taskRepository.save(task);

        log(task, actor, TaskLogAction.DELETED, "active", "true", "false");

        if (task.getAssignee() != null) {
            notify(task.getAssignee().getId(), actor.getId(),
                    NotificationType.TASK_DELETED,
                    "Task deleted: " + task.getTitle(),
                    task.getId());
        }
    }

    // ================= SUBTASK =================

    @Transactional
    public TaskDtos.SubTaskResponse createSubTask(Long actorId, Long taskId, TaskDtos.CreateSubTaskRequest req) {
        User actor = mustUser(actorId);
        Task task = mustActiveTask(taskId);
        assertCanAccessTask(actor, task);

        SubTask st = subTaskRepository.save(
                SubTask.builder()
                        .task(task)
                        .title(req.title())
                        .done(false)
                        .active(true)
                        .build()
        );

        log(task, actor, TaskLogAction.SUBTASK_CREATED, "subtask", null, st.getTitle());

        notifyAssignee(task, actorId,
                NotificationType.SUBTASK_CREATED,
                "New subtask added in task: " + task.getTitle());

        return toSub(st);
    }

    @Transactional
    public TaskDtos.SubTaskResponse patchSubTask(
            Long actorId, Long taskId, Long subTaskId, TaskDtos.PatchSubTaskRequest req
    ) {
        User actor = mustUser(actorId);
        Task task = mustActiveTask(taskId);
        assertCanAccessTask(actor, task);

        SubTask st = mustSubTask(taskId, subTaskId);

        if (req.title() != null && !req.title().equals(st.getTitle())) {
            log(task, actor, TaskLogAction.SUBTASK_UPDATED,
                    "subtask.title", st.getTitle(), req.title());
            st.setTitle(req.title());
        }

        if (req.done() != null && !req.done().equals(st.isDone())) {
            log(task, actor, TaskLogAction.SUBTASK_UPDATED,
                    "subtask.done", String.valueOf(st.isDone()), String.valueOf(req.done()));
            st.setDone(req.done());
        }

        return toSub(subTaskRepository.save(st));
    }

    @Transactional(readOnly = true)
    public TaskDtos.SubTaskResponse getSubTaskDetail(Long actorId, Long taskId, Long subTaskId) {
        User actor = mustUser(actorId);
        Task task = mustActiveTask(taskId);
        assertCanAccessTask(actor, task);

        return toSub(mustSubTask(taskId, subTaskId));
    }

    @Transactional
    public void softDeleteSubTask(Long actorId, Long taskId, Long subTaskId) {
        User actor = mustUser(actorId);
        Task task = mustActiveTask(taskId);
        assertCanAccessTask(actor, task);

        SubTask st = mustSubTask(taskId, subTaskId);
        st.setActive(false);
        st.setDeletedAt(Instant.now());
        subTaskRepository.save(st);

        log(task, actor, TaskLogAction.SUBTASK_DELETED, "subtask", st.getTitle(), null);

        notifyAssignee(task, actorId,
                NotificationType.SUBTASK_DELETE,
                "Subtask deleted in task: " + task.getTitle());
    }

    // ================= COMMENTS =================

    @Transactional
    public TaskDtos.CommentResponse addComment(Long actorId, Long taskId, TaskDtos.CreateCommentRequest req) {
        User actor = mustUser(actorId);
        Task task = mustActiveTask(taskId);
        assertCanAccessTask(actor, task);

        TaskComment c = taskCommentRepository.save(
                TaskComment.builder()
                        .task(task)
                        .author(actor)
                        .content(req.content())
                        .build()
        );

        log(task, actor, TaskLogAction.COMMENTED, "comment", null, "(added)");

        notifyAssignee(task, actorId,
                NotificationType.COMMENT_ADDED,
                "New comment on task: " + task.getTitle());

        return toComment(c);
    }

    // ================= HELPERS =================

    private void notify(Long to, Long from, NotificationType type, String msg, Long taskId) {
        notificationService.createNotification(to, from, type, msg, taskId);
    }

    private void notifyAssignee(Task task, Long actorId, NotificationType type, String msg) {
        if (task.getAssignee() != null && !Objects.equals(task.getAssignee().getId(), actorId)) {
            notify(task.getAssignee().getId(), actorId, type, msg, task.getId());
        }
    }

    private SubTask mustSubTask(Long taskId, Long subTaskId) {
        SubTask st = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new RuntimeException("SUBTASK_NOT_FOUND"));

        if (!st.isActive() || !Objects.equals(st.getTask().getId(), taskId)) {
            throw new RuntimeException("SUBTASK_NOT_FOUND");
        }
        return st;
    }

//    private void update(Task t, User a, String f, Object oldV, Object newV, java.util.function.Consumer<Object> setter) {
//        if (newV != null && !Objects.equals(oldV, newV)) {
//            log(t, a, TaskLogAction.UPDATED, f, String.valueOf(oldV), String.valueOf(newV));
//            setter.accept(newV);
//        }
//    }

    private void mustAdmin(User u) {
        if (u.getRole() != Role.ADMIN) throw new RuntimeException("FORBIDDEN");
    }

    private void assertCanAccessTask(User u, Task t) {
        if (u.getRole() == Role.ADMIN) return;
        if (t.getAssignee() == null || !Objects.equals(t.getAssignee().getId(), u.getId())) {
            throw new RuntimeException("FORBIDDEN");
        }
    }

    private User mustUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
    }

    private Task mustActiveTask(Long id) {
        Task t = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("TASK_NOT_FOUND"));
        if (!t.isActive()) throw new RuntimeException("TASK_NOT_FOUND");
        return t;
    }

    private void log(Task t, User a, TaskLogAction act, String f, String o, String n) {
        taskLogRepository.save(
                TaskLog.builder()
                        .task(t)
                        .actor(a)
                        .action(act)
                        .fieldName(f)
                        .oldValue(o)
                        .newValue(n)
                        .build()
        );
    }

    private TaskDtos.TaskSummaryResponse toSummary(Task t) {
        TaskDtos.UserBrief assignee = t.getAssignee() == null ? null :
                new TaskDtos.UserBrief(
                        t.getAssignee().getId(),
                        t.getAssignee().getEmail(),
                        t.getAssignee().getFullName()
                );

        return new TaskDtos.TaskSummaryResponse(
                t.getId(),
                t.getTitle(),
                t.getStatus(),
                t.getPriority(),
                t.getDueDate(),
                t.getTags(),
                assignee,
                t.isActive(),
                t.getCreatedAt(),
                t.getUpdatedAt(),
                t.getDescription()
        );
    }

    private TaskDtos.SubTaskResponse toSub(SubTask s) {
        return new TaskDtos.SubTaskResponse(
                s.getId(), s.getTitle(), s.isDone(), s.isActive(), s.getCreatedAt()
        );
    }

    private TaskDtos.CommentResponse toComment(TaskComment c) {
        var a = c.getAuthor();
        return new TaskDtos.CommentResponse(
                c.getId(),
                c.getContent(),
                new TaskDtos.UserBrief(a.getId(), a.getEmail(), a.getFullName()),
                c.getCreatedAt()
        );
    }

    private TaskDtos.LogResponse toLog(TaskLog l) {
        var a = l.getActor();
        return new TaskDtos.LogResponse(
                l.getId(),
                l.getAction().name(),
                l.getFieldName(),
                l.getOldValue(),
                l.getNewValue(),
                new TaskDtos.UserBrief(a.getId(), a.getEmail(), a.getFullName()),
                l.getCreatedAt()
        );
    }
}
