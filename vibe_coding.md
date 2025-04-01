# Vibe coding

[참조 Blog](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)

아래 단계를 거쳐 생산되는 `spec.md`, `prompt_plan.md`, `todo.md` 파일을 **project_context** 디렉토리에 위치 시키고 Cursor에 Context로 주입

## Research

- 언어 모델 사용
  - Grok3
  - ChatGPT
  - Claude
- Docs, APIs, 사용할 언어들 등등

## Spec (What)

- Use a conversational LLM to hone in on an idea:

  ```markup
  Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let’s do this iteratively and dig into every relevant detail. Remember, only one question at a time.

  Here’s the idea:

  <IDEA>
  ```

- At the end of the brainstorm (it will come to a natural conclusion):

  ```markup
  Now that we’ve wrapped up the brainstorming process, can you compile our findings into a comprehensive, developer-ready specification? Include all relevant requirements, architecture choices, data handling details, error handling strategies, and a testing plan so a developer can immediately begin implementation.
  ```

- This will output a pretty solid and straightforward spec that can be handed off to the planning step. I like to save it as `spec.md` in the repo.

## Blueprint (How)

It should output a prompt plan that you can execute with aider, cursor, etc. I like to save this as `prompt_plan.md` in the repo.

- TDD prompt

  ```markdown
  Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. Review the results and make sure that the steps are small enough to be implemented safely with strong testing, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

  From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step in a test-driven manner. Prioritize best practices, incremental progress, and early testing, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step.

  Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

  <SPEC>
  ```

- Non-TDD prompt

  ```markdown
  Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. review the results and make sure that the steps are small enough to be implemented safely, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

  From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step. Prioritize best practices, and incremental progress, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step.

  Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

  <SPEC>
  ```

## To-do (Roadmap)

```markdown
Can you make a `todo.md` that I can use as a checklist? Be thorough.
```

- Cursor(or Cline)와 같은 LLM 코딩 툴이 이 파일을 토대로 전체 프로세스 중에 어느 정도 달성 되었는지 알 수 있음
- 사람이 직접 To-do 아이템을 `완료` 표시 할 수도 있고 Cursor에 의해서 표시될 수도 있음. Cursor의 탭을 새로 열어도(새로운 대화) 이 파일을 통해 어디부터 시작해야 하는지 알 수 있음
