# example of an if in Python
if 5 > 2:
    print("Five is greater than two!")
    print("This is in the if block")
elif 5 == 2:
    print("Five is equal to two!")
    print("This is in the elif block")
elif 5 < 2:
    print("Five is less than two!")
    print("This is in the second elif block")
else:
    print("Five is not greater than two!")
    print("This is still in the else block")

# pattern matching
command = ["add", 1, 2]

match command:
    case ["add", x, y]:
        print(f"{x} + {y} = {x + y}")
    case ["sub", x, y]:
        print(f"{x} - {y} = {x - y}")
    case ["mul", x, y]:
        print(f"{x} * {y} = {x * y}")
    case ["quit" | "exit"]:
        print("Goodbye!")
        quit()
    case _:
        print("Unknown command")
