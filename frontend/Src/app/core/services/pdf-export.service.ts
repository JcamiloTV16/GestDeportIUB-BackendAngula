import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  // Paleta de colores institucionales IUB
  private readonly COLOR_NAVY: [number, number, number] = [26, 43, 75];    // #1a2b4b
  private readonly COLOR_GOLD: [number, number, number] = [242, 203, 5];   // #f2cb05
  private readonly COLOR_DARK: [number, number, number] = [51, 51, 51];    // #333333
  private readonly COLOR_GRAY: [number, number, number] = [240, 242, 245]; // #f0f2f5

  /**
   * Genera y descarga el Informe PDF de Seguimiento de Torneo para Administradores.
   */
  generarPdfTorneo(torneo: any, inscritos: any[], estadisticas: any[], ranking: any[]): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const nowStr = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Encabezado Institucional (Header Banner)
    doc.setFillColor(...this.COLOR_NAVY);
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Banda dorada
    doc.setFillColor(...this.COLOR_GOLD);
    doc.rect(0, 26, pageWidth, 3, 'F');

    // Texto Encabezado
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('INSTITUCIÓN UNIVERSITARIA DE BARRANQUILLA', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BIENESTAR UNIVERSITARIO — COORDINACIÓN DE DEPORTES (DAFE)', 14, 18);

    doc.setFontSize(9);
    doc.text('INFORME DE SEGUIMIENTO Y RESULTADOS DE TORNEO', pageWidth - 14, 18, { align: 'right' });

    // 2. Ficha Técnica del Torneo
    let startY = 36;
    doc.setTextColor(...this.COLOR_NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(String(torneo.nombre || 'Torneo Institucional').toUpperCase(), 14, startY);

    startY += 6;
    doc.setFillColor(...this.COLOR_GRAY);
    doc.roundedRect(14, startY, pageWidth - 28, 28, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...this.COLOR_DARK);
    
    // Columna 1
    doc.setFont('helvetica', 'bold');
    doc.text('Deporte:', 18, startY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(String(torneo.deporte_nombre || 'N/A'), 45, startY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', 18, startY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(String(torneo.estado_torneo || 'N/A'), 45, startY + 12);

    doc.setFont('helvetica', 'bold');
    doc.text('Población:', 18, startY + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(String(torneo.poblacion_objetivo || 'Todos'), 45, startY + 18);

    // Columna 2
    doc.setFont('helvetica', 'bold');
    doc.text('Lugar:', 110, startY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(String(torneo.lugar || 'Canchas IUB'), 130, startY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha Inicio:', 110, startY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(String(torneo.fecha_inicio || 'N/A'), 135, startY + 12);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha Fin:', 110, startY + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(String(torneo.fecha_fin || 'N/A'), 135, startY + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', 18, startY + 24);
    doc.setFont('helvetica', 'normal');
    doc.text(String(torneo.descripcion || 'Sin descripción').substring(0, 80), 45, startY + 24);

    startY += 34;

    // 3. Tabla de Posiciones / Ranking Consolidado
    const deporte = torneo.deporte_nombre || '';
    let tituloTablaPosiciones = `Tabla de Posiciones / Ranking — ${deporte}`;
    let headersRanking: string[] = [];
    let bodyRanking: any[] = [];

    if (deporte === 'Ajedrez') {
      headersRanking = ['#', 'Jugador / Deportista', 'Puntos', 'Victorias (V)', 'Empates (E)', 'Derrotas (D)'];
      bodyRanking = (ranking || []).map((r: any, idx: number) => [
        idx + 1,
        r.jugador || 'Participante',
        r.puntos ?? 0,
        r.victorias ?? 0,
        r.empates ?? 0,
        r.derrotas ?? 0,
      ]);
    } else if (deporte === 'Fútbol') {
      headersRanking = ['#', 'Jugador / Goleador', 'Goles Marcados', 'Asistencias'];
      bodyRanking = (ranking || []).map((r: any, idx: number) => [
        idx + 1,
        r.jugador || 'Jugador',
        r.goles ?? 0,
        r.asistencias ?? 0,
      ]);
    } else if (deporte === 'Baloncesto') {
      headersRanking = ['#', 'Jugador / Anotador', 'Puntos Totales', 'Rebotes'];
      bodyRanking = (ranking || []).map((r: any, idx: number) => [
        idx + 1,
        r.jugador || 'Jugador',
        r.puntos ?? 0,
        r.rebotes ?? 0,
      ]);
    } else if (deporte === 'Atletismo') {
      headersRanking = ['#', 'Atleta / Competidor', 'Mejor Tiempo Registrado'];
      bodyRanking = (ranking || []).map((r: any, idx: number) => [
        idx + 1,
        r.atleta || 'Atleta',
        `${r.tiempo ?? '—'} s`,
      ]);
    } else {
      headersRanking = ['#', 'Participante / Competidor', 'Total de Eventos / Puntos'];
      bodyRanking = (ranking || []).map((r: any, idx: number) => [
        idx + 1,
        r.jugador || 'Participante',
        r.total ?? 0,
      ]);
    }

    doc.setTextColor(...this.COLOR_NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(tituloTablaPosiciones, 14, startY);
    startY += 3;

    autoTable(doc, {
      startY,
      head: [headersRanking],
      body: bodyRanking.length > 0 ? bodyRanking : [['—', 'No hay resultados registrados aún', '—', '—', '—', '—']],
      theme: 'grid',
      headStyles: {
        fillColor: this.COLOR_NAVY,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
    });

    // Obtener la posición final después de la primera tabla
    startY = (doc as any).lastAutoTable.finalY + 10;

    // 4. Tabla de Participantes / Inscritos
    doc.setTextColor(...this.COLOR_NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Nómina de Participantes Inscritos (${inscritos.length})`, 14, startY);
    startY += 3;

    const bodyInscritos = (inscritos || []).map((i: any, idx: number) => [
      idx + 1,
      i.estudiante_nombre || i.usuario_nombre || i.nombre || 'Participante',
      i.estudiante_correo || i.usuario_email || i.estudiante_email || i.email || '—',
      i.fecha_inscripcion ? String(i.fecha_inscripcion).substring(0, 10) : 'N/A',
      i.estado_inscripcion || i.estado_nombre || 'Pendiente',
    ]);


    autoTable(doc, {
      startY,
      head: [['#', 'Nombre del Participante', 'Correo Electrónico', 'Fecha Inscripción', 'Estado']],
      body: bodyInscritos.length > 0 ? bodyInscritos : [['—', 'No hay inscritos registrados', '—', '—', '—']],
      theme: 'striped',
      headStyles: {
        fillColor: [50, 60, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
    });

    // 5. Pie de página en todas las páginas
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, doc.internal.pageSize.getHeight() - 12, pageWidth - 14, doc.internal.pageSize.getHeight() - 12);

      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(`GestDeportIUB — Generado el: ${nowStr}`, 14, doc.internal.pageSize.getHeight() - 7);
      doc.text(`Página ${page} de ${totalPages}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 7, {
        align: 'right',
      });
    }

    // Descargar PDF
    const filename = `Informe_Torneo_${String(torneo.nombre || 'Torneo').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  }

  /**
   * Genera y descarga la Planilla PDF de Asistencia Física para Entrenadores.
   */
  generarPlanillaAsistencia(curso: any, estudiantes: any[]): void {
    const doc = new jsPDF({
      orientation: 'landscape', // Horizontal para mayor espacio en las columnas de firmas
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const nowStr = new Date().toLocaleDateString('es-CO');

    // 1. Encabezado Banner IUB
    doc.setFillColor(...this.COLOR_NAVY);
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setFillColor(...this.COLOR_GOLD);
    doc.rect(0, 24, pageWidth, 2.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('INSTITUCIÓN UNIVERSITARIA DE BARRANQUILLA (IUB)', 14, 11);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('DIRECCIÓN DE BIENESTAR UNIVERSITARIO — PLANILLA DE CONTROL DE ASISTENCIA FÍSICA', 14, 18);
    doc.text(`Emisión: ${nowStr}`, pageWidth - 14, 18, { align: 'right' });

    // 2. Datos del Curso / Grupo
    let startY = 32;
    doc.setFillColor(...this.COLOR_GRAY);
    doc.roundedRect(14, startY, pageWidth - 28, 20, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...this.COLOR_DARK);

    // Fila 1
    doc.setFont('helvetica', 'bold');
    doc.text('Curso / Deporte:', 18, startY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(String(curso.deporte_nombre || 'Deporte'), 48, startY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Día de Clase:', 110, startY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(String(curso.dia_semana || 'Por definir'), 135, startY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Horario:', 200, startY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(`${curso.hora_inicio || ''} - ${curso.hora_fin || ''}`, 220, startY + 6);

    // Fila 2
    doc.setFont('helvetica', 'bold');
    doc.text('Lugar de Práctica:', 18, startY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(String(curso.lugar || 'Canchas IUB'), 48, startY + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Cupo Máximo:', 110, startY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(String(curso.cupo || '30'), 135, startY + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Inscritos:', 200, startY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(String(estudiantes.length), 230, startY + 14);

    startY += 26;

    // 3. Tabla de Asistencia con Casillas Impresas
    const bodyEstudiantes = (estudiantes || []).map((e: any, idx: number) => [
      idx + 1,
      e.estudiante_documento || '—',
      e.estudiante_nombre || 'Estudiante',
      e.estudiante_email || '—',
      '', // Sesión 1
      '', // Sesión 2
      '', // Sesión 3
      '', // Sesión 4
      '', // Sesión 5
      '', // Observaciones
    ]);

    autoTable(doc, {
      startY,
      head: [
        [
          '#',
          'Documento',
          'Nombre del Estudiante',
          'Correo Electrónico',
          'Clase 1\nFecha:___',
          'Clase 2\nFecha:___',
          'Clase 3\nFecha:___',
          'Clase 4\nFecha:___',
          'Clase 5\nFecha:___',
          'Firma / Obs.',
        ],
      ],
      body:
        bodyEstudiantes.length > 0
          ? bodyEstudiantes
          : [['—', '—', 'No hay estudiantes inscritos en este curso', '—', '', '', '', '', '', '']],
      theme: 'grid',
      headStyles: {
        fillColor: this.COLOR_NAVY,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 55, fontStyle: 'bold' },
        3: { cellWidth: 55 },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' },
        7: { cellWidth: 20, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
        9: { cellWidth: 22 },
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        minCellHeight: 8, // Altura suficiente para marcar asistencia o firmar
      },
      alternateRowStyles: {
        fillColor: [250, 250, 252],
      },
    });

    // 4. Firmas al final
    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // Si la tabla llena la página, agregar página para las firmas
    if (finalY > pageHeight - 30) {
      doc.addPage();
      finalY = 30;
    }

    doc.setDrawColor(100, 100, 100);
    doc.line(30, finalY, 100, finalY);
    doc.line(180, finalY, 250, finalY);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLOR_DARK);
    doc.text('Firma del Entrenador Asignado', 65, finalY + 4, { align: 'center' });
    doc.text('Coordinación de Bienestar Universitario / DAFE', 215, finalY + 4, { align: 'center' });

    // Pie de página
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(`GestDeportIUB — Control de Asistencia Física`, 14, pageHeight - 6);
      doc.text(`Página ${page} de ${totalPages}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
    }

    const filename = `Planilla_Asistencia_${String(curso.deporte_nombre || 'Curso').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  }
}
