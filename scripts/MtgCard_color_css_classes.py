base_colors = ["red", "green", "blue", "white", "black"]

classes = []


def addClass(name, background):
    classes.append(f">.MtgCard_inner.MtgColor_{name} {{ background: {background}; }}")


# base
for color in base_colors:
    addClass(color, f"$mtg-{color}")

# gold
addClass("gold", "mtg-gold")

# hybrid
for i in range(len(base_colors)):
    for j in range(len(base_colors)):
        if i == j: continue
        addClass(
            f"hybrid_{base_colors[i]}_{base_colors[j]}",
            f"linear-gradient(90deg, $mtg-{base_colors[i]} 0%, $mtg-{base_colors[j]} 100%)",
        )

for c in classes:
    print(c)
