# Vibe coding

1. Research

   - 언어 모델 사용
     - Grok3
     - ChatGPT
     - Claude
   - Docs, APIs, 사용할 언어들 등등

2. Spec (What)

   - Intent
   - Job to be done
   - User

   Spec Example:

   I want to create an application that helps convert someone's todo list into time blocks within their Google Calendar.

   This is a productivity application. Its intent is to help people move away from simple todo lists into blocks of time in their calendar, which whill hold people more accountable and make them more productive overall.

   Here are a few features I'm envisioning:

   - The app can review their exsiting calendar, knowing what time slots are available within a given timeframe that they work each week. This is important to understand, so we're not double booking their work on existing meetings.
   - During the onboarding of a user it should also initially ask for different constraints prior to converting the todos over to a calendar, such as:
     - What hours do you work, what your time zone, do you prefer to have breaks throughout the day for food and mental breaks, if you prefer breaks, how long and when do you prefer to have breaks?
     - Also, do you prefer to do mentally taxing work earlier or later in your working day?
     - Is there a specific task on the todo list that's a priority or has some kind of deadline?
     - Do you prefer to have the event be marked as busy or free within the google calendar features?
   - Then when the todo list is provided to the AI app it should have a few interactions with the user to ensure it understands the context and nuances associated with each todo. Just enough information, so the AI can make an accurate assessment of how long each item will take to complete, so it knows how much time to place on their calendar for each task.
   - Before submitting the events to their calendar, there should be a human validation step, where they present a preview of their calendar with the vents slotted in. If the user is happy they'll accept, if not, you'll present an easy way for them to make minor adjustments through the preview screen. Then they'll accept.
   - The AI will also need to make an assessment for how much time each task will take, this is based on its understanding of workload and process for doing certain tasks
   - We'll want to ensure the user authenticates with Google, and gives the app permissions to read, update, etc. to their G-cal, allowing the app to auto insert the events when possible.

3. Spec Interview

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

4. Bluprint (How)

5. To Do's (Roadmap)

- Macro (거시적)
- Micro (미시적)
