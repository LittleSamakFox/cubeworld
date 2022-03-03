# cubeworld
webgl과 gl-matrix를 이용하여 multi view port 구현
![cubeworld](https://github.com/LittleSamakFox/cubeworld/blob/main/cubeworld.png?raw=true)


0. 개요
 glMatrix 라이브러리 사용하여 mat4.js와 vec3.js를 이용하여 구현하였습니다. UI 패널에서 경도와 위도를 조절할 수 있도록 하였고,
pdf에 서술되어있는 각 부분을 차례대로 제작하였습니다.

1. 구현한 부분
 길이가 2인 큐브를 중앙에 제작하였고, 각 면의 색이 다르도록 제작하였습니다.
 x축, y축, z축을 표시하였고, 경도와 위도를 그렸습니다.
 카메라의 위치에 대한 선이 표시되도록 그렸습니다.
Multi viewport를 적용시켰습니다.
 경도와 위도가 변할 시, 카메라의 위치와 선이 변하도록 하였습니다.

2. 구현하지 못한 부분
 키보드로 화살표의 입력을 받아 경도 위도를 수정하는 것을 시간 부족으로 인하여 구현하지 못하였습니다.

3. function main()
 vertexShaderSource, fragmentShaderSource 정점셰이더와 프래그먼트 셰이더를 작성하였고 이를 main에서 각 셰이더를 컴파일 시켜
link_program에 링크하였습니다.
이벤트리스너를 통하여 경도와 위도가 변할 때, 변하는 수치로 make_new()를 통해 화면이 업데이트 되도록 하였습니다.

4. make_new()
경도와 위도의 값을 받고, VertexBuffer를 생성하여 vertex데이터를 받도록 하였습니다. 이를 생성하기 위하여 createVertexBuffer()를 호출하였습니다.
그뒤 화면을 검은색으로 초기화 시킨뒤, MultiViewPort를 생성하였는데, 이때 첫번째 화면은 perspective와 lookAt을 사용하였고 두번째 화면은 perspective 카메라를 사용하였습니다.
이때, 첫번째 화면은 큐브, x,y,z축, 경도, 위도, 카메라 선이 출력되도록 그렸고, 두번째 화면은 큐브, x,y,z축이 그려지도록 하였습니다.

5. createVertexBuffer()
데이터를 버퍼에 넣고, attrivbute에 데이터를 가져오는 작업을 하였습니다. positionsColors 데이터에는 큐브, x축, y축, z축, 경도, 위도, 카메라 순이고 좌표, 색상값을 넣었습니다.
경도 선의 변화를 주기위하여, 경도 부분인 positionsColors[396]부터 [542]까지 경도가 변화할때 rotateY시켜 선의 변화를 주었고 이와 마찬가지로 카메라의 경우도
positionsColors[546]부터 [548]까지 rotateX, rotateY시켜 변화를 주었습니다.
그리고 이러한 데이터 값을 attribute에 vertexAttribPointer를 통하여 위치 값, 색 값을 전달하였습니다.
