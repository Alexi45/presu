interface CampoTextoProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  tipo?: "text" | "email" | "tel" | "date";
  filas?: number;
}

export function CampoTexto({
  etiqueta,
  valor,
  onChange,
  placeholder,
  tipo = "text",
  filas,
}: CampoTextoProps) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      {filas ? (
        <textarea
          rows={filas}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={tipo}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

interface CampoNumeroProps {
  etiqueta: string;
  valor: number;
  onChange: (valor: number) => void;
  min?: number;
  max?: number;
  paso?: number;
  sufijo?: string;
}

export function CampoNumero({
  etiqueta,
  valor,
  onChange,
  min = 0,
  max,
  paso = 1,
}: CampoNumeroProps) {
  return (
    <label className="campo campo--numero">
      <span className="campo__etiqueta">{etiqueta}</span>
      <input
        type="number"
        value={Number.isFinite(valor) ? valor : 0}
        min={min}
        max={max}
        step={paso}
        onChange={(e) => {
          const n = Number.parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? n : 0);
        }}
      />
    </label>
  );
}

interface CampoCheckProps {
  etiqueta: string;
  ayuda?: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
}

export function CampoCheck({ etiqueta, ayuda, valor, onChange }: CampoCheckProps) {
  return (
    <label className="check">
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {etiqueta}
        {ayuda && <span className="check__ayuda">{ayuda}</span>}
      </span>
    </label>
  );
}

interface CampoSugerenciasProps {
  etiqueta: string;
  valor: string;
  sugerencias: string[];
  lista: string;
  onChange: (valor: string) => void;
}

/** Texto libre con sugerencias: los gremios miden en unidades que no caben en una lista cerrada. */
export function CampoSugerencias({
  etiqueta,
  valor,
  sugerencias,
  lista,
  onChange,
}: CampoSugerenciasProps) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      <input
        type="text"
        value={valor}
        list={lista}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={lista}>
        {sugerencias.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </label>
  );
}

interface CampoSelectProps<T extends string | number> {
  etiqueta: string;
  valor: T;
  opciones: { valor: T; etiqueta: string }[];
  onChange: (valor: T) => void;
}

export function CampoSelect<T extends string | number>({
  etiqueta,
  valor,
  opciones,
  onChange,
}: CampoSelectProps<T>) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      <select
        value={String(valor)}
        onChange={(e) => {
          const bruto = e.target.value;
          const original = opciones.find((o) => String(o.valor) === bruto);
          if (original) onChange(original.valor);
        }}
      >
        {opciones.map((o) => (
          <option key={String(o.valor)} value={String(o.valor)}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}
