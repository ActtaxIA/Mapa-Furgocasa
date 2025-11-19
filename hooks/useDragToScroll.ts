import { useState, useRef } from 'react';

/**
 * Hook personalizado para añadir funcionalidad de drag-to-scroll
 * con efecto de inercia (momentum) como en móviles
 * 
 * @returns Objeto con handlers y propiedades para aplicar al contenedor
 */
export function useDragToScroll() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // No activar drag si se hace click en un botón, enlace o header de tabla
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('th')) {
      return;
    }
    
    const container = e.currentTarget;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    setLastX(e.pageX);
    setLastTime(Date.now());
    setVelocity(0);
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
    
    // Cancelar cualquier animación de inercia en curso
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      applyInertia(e.currentTarget);
      setIsDragging(false);
      e.currentTarget.style.cursor = 'grab';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      applyInertia(e.currentTarget);
      setIsDragging(false);
      e.currentTarget.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = e.currentTarget;
    const x = e.pageX - container.offsetLeft;
    const currentTime = Date.now();
    
    // Calcular velocidad para la inercia
    const deltaX = e.pageX - lastX;
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime > 0) {
      setVelocity(deltaX / deltaTime);
    }
    
    setLastX(e.pageX);
    setLastTime(currentTime);
    
    // Scroll directo (1:1 como en móvil)
    const walk = x - startX;
    container.scrollLeft = scrollLeft - walk;
  };

  // Aplicar inercia después de soltar (efecto momentum como en móvil)
  const applyInertia = (container: HTMLDivElement) => {
    let currentVelocity = velocity * 50; // Amplificar velocidad
    const friction = 0.92; // Fricción para desacelerar gradualmente
    const minVelocity = 0.5; // Velocidad mínima antes de detenerse
    
    const animate = () => {
      if (Math.abs(currentVelocity) < minVelocity) {
        return; // Detener animación
      }
      
      container.scrollLeft -= currentVelocity;
      currentVelocity *= friction; // Aplicar fricción
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    if (Math.abs(currentVelocity) >= minVelocity) {
      animate();
    }
  };

  return {
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseLeave: handleMouseLeave,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove,
    },
    containerStyle: {
      cursor: 'grab' as const,
      WebkitOverflowScrolling: 'touch' as const,
      scrollBehavior: 'auto' as const,
    },
  };
}

