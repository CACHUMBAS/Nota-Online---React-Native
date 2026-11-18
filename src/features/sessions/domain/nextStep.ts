import type { SessionSnapshot } from '../../../shared/domain/classroom.ts';
import { formatVoteCount } from '../../../shared/domain/format.ts';

/** Qué debería hacer ahora el profesor. Es lo que hace la pantalla intuitiva: siempre hay un siguiente paso claro. */
export interface NextStep {
  icon: string;
  title: string;
  detail: string;
  tone: 'accent' | 'success' | 'warning';
}

type Input = Pick<SessionSnapshot, 'session' | 'projects' | 'participant_count'>;

/** Función pura: se decide solo a partir del estado que devuelve el servidor. */
export function teacherNextStep({ session, projects, participant_count: participants }: Input): NextStep {
  if (session.status === 'closed') {
    return {
      icon: '🏁',
      title: 'La sesión ha terminado',
      detail: 'Ya no se puede votar ni añadir trabajos. Consulta los resultados más abajo; cuando no los necesites, puedes borrar la sesión.',
      tone: 'success',
    };
  }

  const open = projects.find((project) => project.status === 'open');
  if (open) {
    return {
      icon: '🗳️',
      title: `Se está votando «${open.title}»`,
      detail: `Han votado ${formatVoteCount(open.vote_count ?? 0)}. Cuando todos terminen, pulsa «Cerrar votación» para ver la media.`,
      tone: 'warning',
    };
  }

  const nobodyYet = participants === 0 ? ' Todavía no ha entrado ningún alumno: enseña el código de arriba.' : '';
  if (projects.length === 0) {
    return {
      icon: '📝',
      title: 'Añade el primer trabajo',
      detail: `Escribe el título de lo que se va a presentar.${nobodyYet}`,
      tone: 'accent',
    };
  }

  const pending = projects.find((project) => project.status === 'pending');
  if (pending) {
    return {
      icon: '▶️',
      title: `Abre la votación de «${pending.title}»`,
      detail: `Los alumnos podrán votar al instante. Solo hay una votación abierta a la vez.${nobodyYet}`,
      tone: 'accent',
    };
  }

  return {
    icon: '✅',
    title: 'Todos los trabajos están valorados',
    detail: 'Añade otro trabajo si falta alguno, o cierra la sesión para terminar.',
    tone: 'success',
  };
}
