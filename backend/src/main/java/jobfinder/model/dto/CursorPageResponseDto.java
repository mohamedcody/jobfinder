package jobfinder.model.dto;

import java.util.List;

public record CursorPageResponseDto<T> (

        List<T> data ,
        int pageSize ,
         Long  nextCursor ,
        boolean hasNext
){}
