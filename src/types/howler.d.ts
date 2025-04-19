declare module 'howler' {
  export class Howl {
    constructor(options: {
      src: string[];
      html5?: boolean;
      loop?: boolean;
      preload?: boolean;
      volume?: number;
      onload?: () => void;
      onplay?: () => void;
      onpause?: () => void;
      onstop?: () => void;
      onend?: () => void;
      [key: string]: any;
    });
    
    play(): number;
    pause(id?: number): this;
    stop(id?: number): this;
    seek(position?: number, id?: number): this | number;
    volume(volume?: number, id?: number): this | number;
    duration(): number;
    state(): string;
    playing(): boolean;
  }
} 