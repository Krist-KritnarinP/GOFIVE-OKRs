/**
 * Accessible, color-coded tiered native <select>.
 * Progressively enhanced with CSS `appearance: base-select` (branded-select-styling)
 * while degrading cleanly to a color-tinted, left-accented native select everywhere else.
 */
export function TieredSelect({
  options = [],
  value,
  onChange,
  disabled = false,
  className = '',
  id,
  name,
  ariaLabel,
  ariaInvalid,
  ariaDescribedBy,
}) {
  const selected = options.find((opt) => String(opt.value) === String(value)) || options[0];
  const tone = selected?.tone || 'neutral';

  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid ?? 'false'}
      aria-describedby={ariaDescribedBy}
      data-tone={tone}
      onChange={onChange}
      className={`tiered-select min-h-10 rounded-md text-xs sm:text-sm font-semibold transition-colors duration-150 ${
        disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
      } ${className}`}
    >
      {options.map((opt) => (
        <option
          key={String(opt.value)}
          value={opt.value}
          data-tone={opt.tone || 'neutral'}
        >
          {opt.prefix ? `${opt.prefix} · ${opt.label}` : opt.label}
        </option>
      ))}
    </select>
  );
}
