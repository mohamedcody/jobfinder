package com.example.jobfinder.model.dto;

import java.util.List;

public record CursorPageResponse<T> (

        List<T> data ,
        int pageSize ,
         Long  nextCursor ,
        boolean hasNext
){}
