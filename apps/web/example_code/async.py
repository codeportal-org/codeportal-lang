import asyncio


async def main():
    # Coroutine that waits for 1 second
    async def wait_for_one_second():
        await asyncio.sleep(1)
        print("Waited for 1 second")

    # Coroutine that waits for 2 seconds
    async def wait_for_two_seconds():
        await asyncio.sleep(2)
        print("Waited for 2 seconds")

    # Create tasks from these coroutines
    task1 = asyncio.create_task(wait_for_one_second())
    task2 = asyncio.create_task(wait_for_two_seconds())

    # Await on the tasks to complete
    await task1
    await task2

    print("Done")

# Start the event loop with the main coroutine
asyncio.run(main())
