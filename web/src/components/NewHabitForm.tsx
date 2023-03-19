import { Check } from "@phosphor-icons/react";

export function NewHabitForm() {
  return (
    <form>
      <label htmlFor="title">Qual seu comprometimento?</label>

      <input
        type="text"
        id="title"
        placeholder="ex.: Exercícios, dormir bem, etc..."
        autoFocus
      />

      <label htmlFor="">Qual a recorrência?</label>

      <button type="submit">
        <Check size={20} weight="bold" />
        Confirmar
      </button>
    </form>
  );
}
